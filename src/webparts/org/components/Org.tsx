import * as React from 'react';
import styles from './Org.module.scss';
import type { IOrgProps } from './IOrgProps';
import FamilyTree from './FamilyTree';
import { OrganizationItem } from '../../../type/types';
import CommonService from '../../../service/common';
import { FieldName } from '../../../constanst/constanst';

const Org: React.FC<IOrgProps> = ({
  title,
  hasTeamsContext,
  context,
  theme,
  fontColor,
  list,
  css
}) => {
  const [reload, setReload] = React.useState(new Date().getTime())
  const commonService = new CommonService(context)
  const isShowButton = commonService.isOwner()
  const [organization, setOrganization] = React.useState<OrganizationItem[]>([]);

  const handleEdit = async (updatedItem: OrganizationItem) => {
    const { Id, ...allowedValues } = updatedItem;
    await commonService.validateUpdateListItem(list, Id, allowedValues);
    setOrganization((prev: any) =>
      prev.map((item: any) => (item.id === updatedItem.Id ? updatedItem : item))
    );
    setReload(new Date().getTime())
  };

  const handleAdd = async (newItem: OrganizationItem) => {
    const path = context.pageContext.web.serverRelativeUrl === "/" ? "" : context.pageContext.web.serverRelativeUrl;
    const decodeUrl = `${path}/Lists/${list}`
    await commonService.AddValidateUpdateItemUsingPath(list, newItem, decodeUrl);
    setOrganization((prev: any) => [...prev, newItem]);
    setReload(new Date().getTime());
  };

  const handleDelete = async (id: string) => {
    await commonService.removeItem(list, id);
    setOrganization((prev: any) =>
      prev.filter((item: any) => item.id !== id && item.parentId !== id)
    );
    setReload(new Date().getTime());
  };

  const handle = async () => {
    const fieldNamesExcludingUser = (Object as any).values(FieldName).filter((field: any) => field !== FieldName.User);
    const items = await commonService.getAllItemsByTitle(list, [
      ...fieldNamesExcludingUser,
      `${FieldName.User}/Title`,
      `${FieldName.User}/Name`, // Account
      `${FieldName.User}/JobTitle`,
      `${FieldName.User}/EMail`,
    ], [
      FieldName.User
    ]);
    setOrganization(items);
  }

  React.useEffect(() => {
    handle();
  }, [reload, list])

  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [css]);

  return (
    <section className={`${styles.org} ${hasTeamsContext ? styles.teams : ''}`}>
      <div className='org_title'>{title}</div>
      <FamilyTree
        isShowButton={isShowButton}
        theme={theme}
        fontColor={fontColor}
        context={context}
        organization={organization}
        onEdit={handleEdit}
        onAdd={handleAdd}
        onDelete={handleDelete}
      />
    </section>
  );
}

export default Org;
