import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';
import CommonService from '../../service/common';
import { FieldName, HOMEPAGE, ListName } from '../../constanst/constanst';
import { IFields } from '@pnp/sp/fields';
import { showPopupNotification } from './helper';

const LOG_SOURCE: string = 'OrgApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IOrgApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class OrgApplicationCustomizer
  extends BaseApplicationCustomizer<IOrgApplicationCustomizerProperties> {

  private async handle() {
    const commonService = new CommonService(this.context);
    const isCreated = await commonService.ensureList(ListName.Org);
    commonService.test();
    if (isCreated) {
      const fieldsToCreate = [
        { [FieldName.Department]: (fields: IFields) => fields.addText(FieldName.Department) },
        { [FieldName.Link]: (fields: IFields) => fields.addText(FieldName.Link) },
        { [FieldName.Location]: (fields: IFields) => fields.addText(FieldName.Location) },
        { [FieldName.Description]: (fields: IFields) => fields.addText(FieldName.Description) },
        { [FieldName.ParentId]: (fields: IFields) => fields.addNumber(FieldName.ParentId) },
        { [FieldName.Orders]: (fields: IFields) => fields.addNumber(FieldName.Orders) },
        { [FieldName.User]: (fields: IFields) => fields.addUser(FieldName.User) },
        { [FieldName.Format]: (fields: IFields) => fields.addText(FieldName.Format) },
      ];
      for (const field of fieldsToCreate) {
        const [key] = Object.keys(field);
        await commonService.createField(ListName.Org, field[key], { Title: key });
      }
    }
  }

  private async handleCreateTemplate() {
    try {
      const commonService = new CommonService(this.context);
      // pls fix nameHomePage
      const page = await commonService.getHomepage();
      const pages = await commonService.getAllItemsByTitle('Site Pages', ['Title']);
      const serverRelativeUrl = this.context.pageContext.web.serverRelativeUrl;
      if (
        (pages?.some((a: any) => a.Title === "Home Page") &&
          page.toString().includes(HOMEPAGE)) ||
        serverRelativeUrl === '/'
      ) return;
      const suscess = await commonService.applyTemplate("HomePage.aspx");
      commonService.makeHomepage();
      if (!suscess) return;
      showPopupNotification('Applied Template!');
    } catch (err) {
      console.log('handleCreateTemplate:', JSON.stringify(err));
    }
  }

  public onInit(): Promise<void> {
    debugger;
    // Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);
    this.handleCreateTemplate();
    this.handle();
    return Promise.resolve();
  }
}
