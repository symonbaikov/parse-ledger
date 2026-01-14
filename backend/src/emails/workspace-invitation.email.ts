import * as React from 'react';

export type WorkspaceInvitationEmailProps = {
	workspaceName: string;
	invitationLink: string;
	invitedBy?: string | null;
	roleLabel?: string | null;
};

export function WorkspaceInvitationEmail({
	workspaceName,
	invitationLink,
	invitedBy,
	roleLabel,
}: WorkspaceInvitationEmailProps) {
	const previewText = `Приглашение в рабочее пространство ${workspaceName}`;
	const roleLine = roleLabel ? `Роль: ${roleLabel}` : '';
	const invitedByLine = invitedBy ? `${invitedBy} приглашает вас присоединиться` : 'Вас приглашают присоединиться';

	return React.createElement(
		'div',
		{},
		[
			React.createElement('p', { key: 'preview' }, previewText),
			React.createElement('p', { key: 'invited' }, `${invitedByLine} к «${workspaceName}». ${roleLine}`.trim()),
			React.createElement('p', { key: 'link' }, `Принять приглашение: ${invitationLink}`),
			React.createElement('p', { key: 'hint' }, 'Ссылка действует 7 дней.'),
		],
	);
}

export function workspaceInvitationEmailText({
	workspaceName,
	invitationLink,
	invitedBy,
	roleLabel,
}: WorkspaceInvitationEmailProps) {
	const invitedByPart = invitedBy ? `${invitedBy} приглашает вас присоединиться к` : 'Вас приглашают присоединиться к';
	const rolePart = roleLabel ? `\nРоль: ${roleLabel}` : '';

	return `${invitedByPart} «${workspaceName}».${rolePart}\n\nПринять приглашение: ${invitationLink}\n\nСсылка действует 7 дней.`;
}
