import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const secretManager = new SecretManagerServiceClient();

export const createSecretRepository = (key: string) => {
    const get = async () => {
        return secretManager
            .getProjectId()
            .then((projectId) => `projects/${projectId}/secrets/${key}/versions/latest`)
            .then((name) => secretManager.accessSecretVersion({ name }))
            .then(([res]) => res.payload?.data?.toString() || '');
    };

    const set = async (value: string) => {
        const payload = { data: Buffer.from(value, 'utf-8') };

        return secretManager
            .getProjectId()
            .then((projectId) => `projects/${projectId}/secrets/${key}`)
            .then((parent) => secretManager.addSecretVersion({ parent, payload }));
    };

    return { get, set };
};
