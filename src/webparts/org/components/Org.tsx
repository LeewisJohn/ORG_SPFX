import * as React from 'react';
import styles from './Org.module.scss';
import type { IOrgProps } from './IOrgProps';
import FamilyTree from './FamilyTree';
import { OrganizationItem } from '../../../type/types';
import CommonService from '../../../service/common';
import { FieldName, ListName } from '../../../constanst/constanst';

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

  // Xử lý chỉnh sửa node
  const handleEdit = async (updatedItem: OrganizationItem) => {
    const { Id, ...allowedValues } = updatedItem;
    await commonService.validateUpdateListItem(list, Id, allowedValues);
    setOrganization((prev: any) =>
      prev.map((item: any) => (item.id === updatedItem.Id ? updatedItem : item))
    );
    setReload(new Date().getTime())
  };

  // Xử lý thêm node mới
  const handleAdd = async (newItem: OrganizationItem) => {
    const path = context.pageContext.web.serverRelativeUrl === "/" ? "" : context.pageContext.web.serverRelativeUrl;
    const decodeUrl = `${path}/Lists/${list}`
    await commonService.AddValidateUpdateItemUsingPath(list, newItem, decodeUrl);
    setOrganization((prev: any) => [...prev, newItem]);
    setReload(new Date().getTime());
  };

  // Xử lý xóa node
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

    // const items32 = await commonService.getAllItemsByTitle("Tasks", ["Id"]);
    // for (let i = 0; i < items32.length; i++) {
    //   await commonService.removeItem("Tasks", items32[i].Id);
    // }
  }

  const refreshHeght = () => {
    if (!organization.length) return;
    const treeNodes = document.querySelectorAll('.node-title') as any;
    const maxHeight = Math.max(...[...(treeNodes)].map(x => x.offsetHeight));
    // Apply the maximum height to all nodes
    (window as any).hasAv = (window as any).hasAv || (organization.some(a => a.User) ? 48 : 1);
    treeNodes.forEach((node: any) => {
      node.style.height = maxHeight - 10 + ((window as any).hasAv == 1 ? 0 : (window as any).hasAv) + 'px';
    });
    (window as any).hasAv = 1;
  }

  React.useEffect(() => {
    handle();
    // refreshHeght();
  }, [reload, list])

  React.useEffect(() => {
    // refreshHeght();
  }, [organization])

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
