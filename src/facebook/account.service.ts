import { getClient } from './api.service';

type ListAccountsResponse = { data: { account_id: string; id: string; name: string }[] };

export const getAccounts = async () => {
    const client = await getClient();

    const BUSINESS_ID = 1713955361985761;

    return Promise.all(
        ['client_ad_accounts', 'owned_ad_accounts'].map(async (edge) => {
            return client
                .request<ListAccountsResponse>({
                    method: 'GET',
                    params: { limit: 500, fields: ['name', 'account_id'] },
                    url: `/${BUSINESS_ID}/${edge}`,
                })
                .then((response) => {
                    return response.data.data.map((row) => ({
                        account_id: row.account_id,
                        account_name: row.name,
                    }));
                });
        }),
    ).then((accountGroups) => accountGroups.flat());
};
