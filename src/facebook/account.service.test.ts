import { getAccounts } from './account.service';

it('get-accounts', async () => {
    return getAccounts()
        .then((result) => {
            console.log(result);
            expect(result).toBeDefined();
        })
        .catch((error) => {
            console.error({ error });
            return Promise.reject(error);
        });
});
