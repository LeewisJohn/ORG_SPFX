import { useState } from "react";
import * as React from "react";
import { OrganizationItem } from '../../../type/types';
import { Button, Space, Modal, Form, Input } from "antd";
import { EditOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { LivePersona } from "@pnp/spfx-controls-react/lib/LivePersona";
import { IPeoplePickerContext, PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { Persona } from "@fluentui/react";
import "./FamilyTree.css";
import { parseCSSString } from "../utils/helper";

interface FamilyTreeProps {
    context: any;
    theme: string,
    fontColor: string,
    organization: OrganizationItem[];
    isShowButton: Boolean;
    onEdit: (updatedItem: OrganizationItem) => void;
    onAdd: (newItem: OrganizationItem) => void;
    onDelete: (id: string) => void;
}

const FamilyTree: React.FC<FamilyTreeProps> = ({
    theme,
    context,
    fontColor,
    organization,
    isShowButton,
    onEdit,
    onAdd,
    onDelete,
}) => {
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<OrganizationItem | null>(null);
    const [parentId, setParentId] = useState<string | null>(null);

    const peoplePickerContext: IPeoplePickerContext = {
        absoluteUrl: context.pageContext.web.absoluteUrl,
        msGraphClientFactory: context.msGraphClientFactory,
        spHttpClient: context.spHttpClient
    };

    const handleEdit = (item: OrganizationItem) => {
        form.resetFields();
        form.setFieldsValue(item)
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const handleAdd = (parentId: string | null) => {
        form.resetFields();
        setCurrentItem(null);
        setParentId(parentId);
        setIsModalOpen(true);
    };

    const handleSubmit = (values: Partial<OrganizationItem>) => {
        const {
            User: { Name },
            User: {
                Name: [{ id = null } = {}] = [{}]
            } = {}
        } = values as any;
        const account = id || (Name?.length ? Name : null);
        if (currentItem) {
            const newValue = {
                ...values,
                User: account
            } as any
            onEdit(newValue);
        } else {
            const newItem: any = {
                ...values,
                ParentId: parentId,
                User: account,
                Orders: organization.length + 1, // Append to the end
            };
            onAdd(newItem);
            setIsModalOpen(false);
            setParentId(null);
        }
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const renderTree = (parentId: string | null): JSX.Element | null => {
        const children = organization.filter((item) => item.ParentId === parentId);

        if (children.length === 0) {
            return null;
        }
        return (
            <div className="tree-branch">
                {children.sort((a, b) => (a.Orders || 0) - (b.Orders || 0)).map((item) => (
                    <div key={item.Id} className={parentId == null ? `parent tree-node tree-node-${item.Id}` : `tree-node tree-node-${item.Id}`}>
                        <div className={`node-content node-${item.Id}`} style={item.Format ? parseCSSString(item.Format) : { backgroundColor: theme, color: fontColor }}>
                            <div
                                className="node-title"
                                onClick={() => item.Link && window.open(item.Link, "_blank")}
                            >
                                {
                                    item.User &&
                                    <LivePersona upn={item.User.EMail}
                                        template={
                                            <Persona
                                                text={item.User.Title}
                                                secondaryText={item.User.JobTitle}
                                                imageUrl={`https://test.sharepoint.com/_layouts/15/userphoto.aspx?size=S&accountname=${item.User.EMail}`}
                                            />
                                        }
                                        serviceScope={context.serviceScope}
                                    />
                                }
                                <div>{item.Title}</div>
                                <div>{item.Location}</div>
                                <div>{item.Department}</div>
                                <div>{item.Description}</div>
                            </div>
                            <div className="node-actions">
                                {
                                    isShowButton &&
                                    <Space>
                                        <Button
                                            type="link"
                                            icon={<EditOutlined />}
                                            onClick={() => handleEdit(item)}
                                        />
                                        <Button
                                            type="link"
                                            icon={<PlusOutlined />}
                                            onClick={() => handleAdd(item.Id)}
                                        />
                                        <Button
                                            type="link"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => onDelete(item.Id)}
                                        />
                                    </Space>
                                }
                            </div>
                        </div>
                        {renderTree(item.Id)}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="tree-container">
            {renderTree(null)}

            {isShowButton &&
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleAdd(null)}
                    >
                        Add Root Item
                    </Button>
                </div>}

            <Modal
                title={currentItem ? "Edit Item" : "Add Item"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="Id"
                        label="Id"
                        hidden={true}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="Title"
                        label="Title"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name={['User', 'Name']}
                        label="User"
                    >
                        <PeoplePicker
                            context={peoplePickerContext}
                            personSelectionLimit={1}
                            showtooltip={true}
                            defaultSelectedUsers={[currentItem?.User?.EMail]}
                            principalTypes={[PrincipalType.User]}
                        />
                    </Form.Item>
                    <Form.Item
                        name="Department"
                        label="Department"
                        hidden={true}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="Description"
                        label="Description"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="Location"
                        label="Location"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="Link"
                        label="Link"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="Format"
                        label="Format"
                    >
                        <Input />
                    </Form.Item>
                    <div style={{ textAlign: "right" }}>
                        <Button
                            onClick={() => setIsModalOpen(false)}
                            style={{ marginRight: 8 }}
                        >
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Save
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default FamilyTree;
