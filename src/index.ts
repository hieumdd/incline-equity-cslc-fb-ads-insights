import express from 'express';
import { http } from '@google-cloud/functions-framework';

import { logger } from './logging.service';
import {
    CreatePipelineTasksBodySchema,
    RunPipelineBodySchema,
} from './pipeline/pipeline.request.dto';
import * as pipelines from './pipeline/pipeline.const';
import { runPipeline, createInsightsPipelineTasks } from './pipeline/pipeline.service';
import { refreshToken } from './facebook/token.service';

const app = express();

app.use(({ headers, path, body }, _, next) => {
    logger.info({ headers, path, body });
    next();
});

app.use('/refresh-token', (_, res) => {
    refreshToken()
        .then((result) => res.status(200).json({ result }))
        .catch((error) => {
            logger.error({ error });
            res.status(500).json({ error });
        });
});

app.use('/task', ({ body }, res) => {
    CreatePipelineTasksBodySchema.validateAsync(body)
        .then((value) => {
            createInsightsPipelineTasks(value)
                .then((result) => res.status(200).json({ result }))
                .catch((error) => {
                    logger.error({ error });
                    res.status(500).json({ error });
                });
        })
        .catch((error) => {
            logger.warn({ error });
            res.status(400).json({ error });
        });
});

app.use('/', ({ body }, res) => {
    RunPipelineBodySchema.validateAsync(body)
        .then((value) => {
            runPipeline(pipelines[value.pipeline], {
                accountId: value.accountId,
                start: value.start,
                end: value.end,
            })
                .then((result) => res.status(200).json({ result }))
                .catch((error) => {
                    logger.error({ error });
                    res.status(500).json({ error });
                });
        })
        .catch((error) => {
            logger.warn({ error });
            res.status(400).json({ error });
        });
});

http('main', app);
