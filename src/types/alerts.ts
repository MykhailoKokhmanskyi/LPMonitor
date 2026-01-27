export type AlertCategory = 'danger' | 'success' | 'warning' | 'info'

export interface Alert {
	type: AlertCategory;
	title: string;
	msg: string;
}
