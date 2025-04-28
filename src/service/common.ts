import { SPBrowser, SPFI, SPFx, spfi } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";
import "@pnp/graph/users";
import "@pnp/graph/sites";
import "@pnp/sp/folders";
import "@pnp/sp/clientside-pages/web";
import { SPPermission } from '@microsoft/sp-page-context';
import { IFieldCreationProperties, IFieldInfo } from "@pnp/sp/fields";
import "@pnp/sp/files";
import { createBatch } from "@pnp/sp/batching";
import "@pnp/sp/batching";
import { BASE_URI } from "../constanst/constanst";
import { CreateClientsidePage, IClientsidePage } from "@pnp/sp/clientside-pages";

export default class CommonService {
  private sp: SPFI;
  private graph: any;

  constructor(private context: any) {
    this.sp = spfi().using(SPFx(context));
  }

  public async makeHomepage(pageName: string = "HomePage.aspx") {
    try {
      const result = await this.sp.web.rootFolder.update({
        WelcomePage: `SitePages/${pageName}`
      });
    } catch (err) {
      console.log('Org:', JSON.stringify(err));
      return false;
    }
  }

  public async getHomepage() {
    try {
      const result = await this.sp.web();
      return result.WelcomePage
    } catch (err) {
      console.log('Org:', JSON.stringify(err));
      return false;
    }
  }

  public async test() {
    try {
      // const graph = graphfi(...);
      const allUsers = await this.graph.me();
      console.log(allUsers);
    } catch (err) {
      console.log('Org:', JSON.stringify(err));
      return false;
    }
  }

  public async getSiteId() {
    try {
      // const graph = graphfi(...);
      const allUsers = await this.graph.me();
      console.log(allUsers);
    } catch (err) {
      console.log('Org:', JSON.stringify(err));
      return false;
    }
  }

  public async checkListExist(title: string): Promise<boolean> {
    try {
      const list = this.sp.web.lists.getByTitle(title);
      return !!list;
    } catch (err) {
      console.log('Org:', JSON.stringify(err));
      return false;
    }
  }

  public async addItem(listTitle: string, object: any): Promise<any | false> {
    try {
      const iar: any = await this.sp.web.lists.getByTitle(listTitle).items.add(object);
      return iar;
    } catch (err) {
      console.log('Org:', JSON.stringify(err));
      return false;
    }
  }

  public async getTheme(): Promise<void> {
    try {
      const response: any = await this.sp.web.select("Url").expand("ThemeInfo")();
      const themes = response.ThemeInfo.ThemedCssFolderUrl;
      console.log(themes);
    } catch (error) {
      console.log('Org:', JSON.stringify(error));
    }
  }

  public async removeItem(listTitle: string, id: any): Promise<boolean> {
    try {
      await this.sp.web.lists.getByTitle(listTitle).items.getById(id).delete();
      return true;
    } catch (err) {
      console.log('Org:', JSON.stringify(err));
      return false;
    }
  }

  public async createTextField(listTitle: string, fieldName: string): Promise<any | false> {
    try {
      const field: any = await this.sp.web.lists.getByTitle(listTitle).fields.addText(fieldName, { MaxLength: 255, Group: "My Group" });
      return field;
    } catch (err) {
      console.log('Org:', JSON.stringify(err));
      return false;
    }
  }

  public async createField(
    listTitle: string,
    // fieldName: string,
    method: (fields: any, properties?: IFieldCreationProperties) => Promise<Partial<IFieldInfo>>,
    options: IFieldCreationProperties
  ): Promise<Partial<IFieldInfo> | false> {
    try {
      const fields = this.sp.web.lists.getByTitle(listTitle).fields;
      const field: Partial<IFieldInfo> = await method(fields, options);
      return field;
    } catch (err) {
      console.log("Error:", JSON.stringify(err));
      return false;
    }
  }

  public async ensureList(title: string): Promise<boolean> {
    try {
      const listEnsureResult = await this.sp.web.lists.ensure(title);
      return listEnsureResult.created;
    } catch (err) {
      console.log('Org:', JSON.stringify(err));
      return false;
    }
  }

  public async getAllList(): Promise<any[]> {
    try {
      const lists = (await this.sp.web.lists.select('title', 'id', 'BaseTemplate')())
        .filter((x: any) => x.BaseTemplate === 100)
        .map((x: any) => ({
          key: x.Id,
          text: x.Title,
        }));
      return lists;
    } catch (err) {
      console.log('Org:', JSON.stringify(err));
      return [];
    }
  }

  public async getAllItemsById(listId: string, fields: string[]): Promise<any[]> {
    try {
      const items: any = await this.sp.web.lists.getById(listId).items.select(...fields).top(5000);
      return items;
    } catch (err) {
      console.log('Org:', JSON.stringify(err));
      return [];
    }
  }

  public async getAllItemsByTitle(listTitle: string, fields: string[] = [], expand: string[] = []): Promise<any[]> {
    try {
      const items: any = await this.sp.web.lists.getByTitle(listTitle).items.top(5000).select(...fields).expand(...expand)();
      return items;
    } catch (err) {
      console.log('Org:', JSON.stringify(err));
      return [];
    }
  }

  public async updateItem(listTitle: string, id: any, object: any): Promise<any> {
    try {
      const updatedItem = await this.sp.web.lists.getByTitle(listTitle).items.getById(id).update(object);
      return updatedItem;
    } catch (err) {
      console.log('Org:', JSON.stringify(err));
      return null;
    }
  }

  public async AddValidateUpdateItemUsingPath(listTitle: string, object: any, decodedUrl: string): Promise<any | false> {
    try {
      delete object.Id;
      const fields = (Object as any).entries(object).map(([key, value]: [any, any]) =>
        (/^i:0#.f\|membership\|[^@]+@[^@]+\.[^@]+$/.test(value)) ? ({
          FieldName: key,
          FieldValue: JSON.stringify([{ "Key": value }]),
        }) : ({
          FieldName: key,
          FieldValue: value ? String(value) : value,
        })
      );

      const iar: any = await this.sp.web.lists.getByTitle(listTitle).addValidateUpdateItemUsingPath(fields, decodedUrl);
      return iar;
    } catch (err) {
      console.log('Org:', JSON.stringify(err));
      return false;
    }
  }

  public async validateUpdateListItem(listTitle: string, id: any, object: any) {
    try {
      const updateFields = (Object as any).entries(object).map(([key, value]: [any, any]) =>
        (/^i:0#.f\|membership\|[^@]+@[^@]+\.[^@]+$/.test(value)) ? ({
          FieldName: key,
          FieldValue: JSON.stringify([{ "Key": value }]),
        }) : ({
          FieldName: key,
          FieldValue: value,
        })
      );

      const updatedItem = await this.sp.web.lists.getByTitle(listTitle)
        .items
        .getById(id)
        .validateUpdateListItem(updateFields);
      return updatedItem;
    } catch (err) {
      console.log('Error:', JSON.stringify(err));
      return null;
    }
  }

  /**
   * Check Roles of current user
   */
  public isOwner(): boolean {
    const perm = new SPPermission(this.context.pageContext.web.permissions.value);
    return perm.hasPermission(SPPermission.manageWeb);
  }

  // read contect -> update content to target in siteAssets -> Copy from site Asset to SitePages -> Publish
  public async applyTemplate(nameHomePage: string): Promise<any> {
    try {
      // our page instances, loaded in any of the ways shown above
      const sp = spfi().using(SPBrowser({ baseUrl: BASE_URI }));
      const sourceFileUrl = "/SitePages/Templates/Department.aspx";
      const source: IClientsidePage = await sp.web.loadClientsidePage(sourceFileUrl);

      const page1 = await CreateClientsidePage(this.sp.web, nameHomePage, "Home Page", "Home");
      await source.copyTo(page1);

      return true;
    } catch (err) {
      console.log('Org:', JSON.stringify(err));
      return null;
    }
  }

  public async deleteItems(listName: string) {
    const list = this.sp.web.lists.getByTitle(listName);
    const items = await list.items();
    const [batchedListBehavior, execute] = createBatch(list);
    list.using(batchedListBehavior);
    items.forEach((i: any) => {
      list.items.getById(i["ID"]).delete();
    });
    await execute();
  };
}

