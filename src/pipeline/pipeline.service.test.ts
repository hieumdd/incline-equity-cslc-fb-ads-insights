import * as pipelines from './pipeline.const';
import { createInsightsPipelineTasks, runPipeline } from './pipeline.service';

it('pipeline', async () => {
    return runPipeline(pipelines.ADS_INSIGHTS, {
        accountId: '1796773357039729',
        start: '2023-09-01',
        end: '2023-10-01',
    })
        .then((results) => expect(results).toBeDefined())
        .catch((error) => {
            console.error({ error });
            throw error;
        });
});

it('create-tasks', async () => {
    return createInsightsPipelineTasks({
        start: '2023-01-01',
        end: '2023-03-01',
    })
        .then((result) => expect(result).toBeDefined())
        .catch((error) => {
            console.error({ error });
            throw error;
        });
});
