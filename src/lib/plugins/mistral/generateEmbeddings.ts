import icon from './icon.svg';
import {action} from '$lib/core/plugins/action';
import type {JsonSchema} from '$lib/schema/schema';

const configSchema = {
    type: 'object',
    required: ['url', 'apiKey', 'model', 'inputs'],
    properties: {
        url: {type: 'string'},
        apiKey: {type: 'string'},
        //
        model: {type: 'string'},
        inputs: {type: 'array', items: {type: 'string'}},
    },
} satisfies JsonSchema;

const urls = ['https://api.mistral.ai'];
const models = ['mistral-embed'];

export default action<typeof configSchema>({
    icon,
    color: '#ff7000',
    description: `generate embeddings using Mistral's embedding models`,
    //
    form({config}) {
        return {
            type: 'object',
            required: ['url', 'apiKey', 'model', 'input'],
            properties: {
                url: {type: 'string', default: config.url, suggestions: urls},
                apiKey: {type: 'string', default: config.apiKey, title: 'api key'},
                //
                model: {type: 'string', default: config.model, suggestions: models},
                inputs: {type: 'array', items: {type: 'string'}, default: config.inputs},
            },
        };
    },
    data({form, config}) {
        return {
            valid: true,
            config: {
                value: {
                    url: form?.url ?? config?.url ?? 'https://api.mistral.ai',
                    apiKey: form?.apiKey ?? config?.apiKey ?? '',
                    //
                    model: form?.model ?? config?.model ?? models[0],
                    inputs: form?.inputs ?? config?.inputs ?? [],
                },
                schema: configSchema,
            },
            inputs: ['in'],
            outputs: ['out'],
            results: {
                embeddings: {type: 'array', items: {type: 'number'}},
            },
        };
    },
});
