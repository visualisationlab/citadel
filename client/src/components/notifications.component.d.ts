/// <reference types="react" />
export interface NotificationType {
    title: string;
    message: string;
    status: 'success' | 'info' | 'warning' | 'danger';
}
export default function Notifications(): JSX.Element;
