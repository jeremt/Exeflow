import {resolve} from '$lib/helper/parse.server';
import type {ActionId} from './plugins/action';
import type {TriggerId} from './plugins/trigger';
import type {JsonSchema} from '$lib/schema/schema';
import type {GraphContext} from './core';
import type {ServerAction} from './plugins/action.server';
import type {ServerTrigger} from './plugins/trigger.server';
import type {PluginNode, ActionNode, TriggerNode} from './graph/nodes';

interface ExecuteArgs<T extends PluginNode> {
    node: T;
    context: GraphContext;
    serverActions: Record<ActionId, ServerAction<JsonSchema>>;
    serverTriggers: Record<TriggerId, ServerTrigger<JsonSchema>>;
}

interface ExecuteStep {
    out?: string;
    results: Record<string, unknown>;
}

const execute = async function* ({node, context, serverActions, serverTriggers}: ExecuteArgs<ActionNode>): AsyncGenerator<ExecuteStep> {
    const serverAction = serverActions[node.data.id];
    if (!serverAction) throw new Error(`server action ${node.data.id} not found`);
    const generator = serverAction.exec({config: resolve(node.data.data.config.value, node.data.data.config.schema)});

    while (true) {
        const {done, value} = await generator.next();
        yield value;
        if (value.out) {
            const next = context.findNextActionNode(node.id, value.out);
            if (next) {
                yield* execute({node: next, context, serverActions, serverTriggers});
            }
        }
        if (done) break;
    }
};

export const executeTrigger = async function* ({node, context, serverActions, serverTriggers}: ExecuteArgs<TriggerNode>) {
    const next = context.findNextActionNode(node.id, 'out');
    if (next) {
        yield* execute({node: next, context, serverActions, serverTriggers});
    }
};
