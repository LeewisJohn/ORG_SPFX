import { AadHttpClient, IHttpClientOptions } from "@microsoft/sp-http";

const SITE_ID = '947d077c-b2ad-47f7-830b-c60dc587337e';
const API = 'https://graph.microsoft.com/v1.0';

export default class GraphService {
    private ctx: any;
    private client: AadHttpClient | null = null;

    constructor(private context: any) {
        this.ctx = context;
    }

    private async ensureClient(): Promise<AadHttpClient> {
        if (!this.client) {
            this.client = await this.ctx.aadHttpClientFactory.getClient("https://graph.microsoft.com");
        }
        return this.client as AadHttpClient;
    }

    private async request(
        method: "GET" | "POST",
        url: string,
        options?: IHttpClientOptions
    ): Promise<any> {
        const client = await this.ensureClient();
        const response = await client[method.toLowerCase() as 'get' | 'post'](`${API}${url}`, AadHttpClient.configurations.v1, options || {});
        if (response.ok) {
            return response.json().catch(() => ({}));
        }
        return false;
    }

    public async searchSite(pagePath: string) {
        const data = await this.request(
            "GET",
            `/sites/${SITE_ID}/sites?$search="${pagePath}"&$select=id,webUrl`
        );
        return data?.value;
    }

    public async createPage(webId: string, template: any) {
        return await this.request(
            "POST",
            `/sites/${webId}/pages`,
            {
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(template),
            }
        );
    }

    public async publicPage(siteId: string, pageId: any) {
        return this.request(
            "POST",
            `/sites/${siteId}/pages/${pageId}/microsoft.graph.sitePage/publish`,
            {
                headers: {
                    "Content-Type": "application/json",
                }
            }
        );
    }
}
