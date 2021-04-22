// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { css } from '@uifabric/utilities';
import * as Markup from 'assessments/markup';
import { BlockingDialog } from 'common/components/blocking-dialog';
import { NewTabLink } from 'common/components/new-tab-link';
import { Tab } from 'common/itab';
import { PersistedTabInfo } from 'common/types/store-data/assessment-result-data';
import { UrlParser } from 'common/url-parser';
import * as commonDialogStyles from 'DetailsView/components/common-dialog-styles.scss';
import * as styles from 'DetailsView/components/target-change-dialog.scss';
import { isEmpty } from 'lodash';
import { DefaultButton, DialogFooter, DialogType, TooltipHost } from 'office-ui-fabric-react';
import * as React from 'react';
import { DetailsViewActionMessageCreator } from '../actions/details-view-action-message-creator';
import { NamedFC } from 'common/react/named-fc';

export type ChangeAssessmentDialogDeps = {
    urlParser: UrlParser;
    detailsViewActionMessageCreator: DetailsViewActionMessageCreator;
};

export interface ChangeAssessmentDialogProps {
    deps: ChangeAssessmentDialogDeps;
    prevTab: PersistedTabInfo;
    newTab: Tab;
    dialogContentTitle: string,
    subtitleAriaId: string,
    divId: string,
    leftButtonText: string,
    leftButtonOnClick,
    rightButtonText: string,
    rightButtonOnClick,
    dialogFirstText: JSX.Element,
    dialogNoteText: string,
    dialogWarningText:string,
}

export const ChangeAssessmentDialog = NamedFC<ChangeAssessmentDialogProps>(
    'ChangeAssessmentDialog',
    props => {
        const { prevTab, newTab } = props;
        if (!showTargetChangeDialog(prevTab, newTab)) {
            return null;
        }

        return (
            <BlockingDialog
                hidden={false}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: props.dialogContentTitle,
                }}
                modalProps={{
                    className: styles.targetChangeDialogModal,
                    containerClassName: css(
                        commonDialogStyles.insightsDialogMainOverride,
                        styles.targetChangeDialog,
                    ),
                    subtitleAriaId: props.subtitleAriaId,
                }}
            >
                <div id={props.divId}>
                    <div>
                        There is already an assessment running on&nbsp;
                        {renderPreviousTabLink(props.prevTab)}.&nbsp;

                        {props.dialogFirstText} 
                    </div>
                    <p>
                        <Markup.Term>Note</Markup.Term>: {props.dialogNoteText}
                    </p>
                    <p>{props.dialogWarningText}</p>
                </div>

                <DialogFooter>
                    <div className={styles.targetChangeDialogButtonContainer}>
                        <div className={css(styles.actionCancelButtonCol, styles.continueButton)}>
                            <DefaultButton
                                autoFocus={true}
                                text= { props.leftButtonText }
                                onClick={
                                    props.leftButtonOnClick
                                }
                            />
                        </div>
                        <div className={css(styles.actionCancelButtonCol, styles.restartButton)}>
                            <DefaultButton
                                text={props.rightButtonText}
                                onClick={
                                    props.rightButtonOnClick
                                }
                            />
                        </div>
                    </div>
                </DialogFooter>
            </BlockingDialog>
        );

        function renderPreviousTabLink(tab: Tab): JSX.Element {
            return (
                <TooltipHost
                    content={tab.url}
                    id={'previous-target-page-link'}
                    calloutProps={{ gapSpace: 0 }}
                >
                    <NewTabLink role="link" href={tab.url}>
                        {tab.title}
                    </NewTabLink>
                </TooltipHost>
            );
        }

        function showTargetChangeDialog(prevTab: PersistedTabInfo, newTab: Tab): boolean {
            if (isEmpty(prevTab)) {
                return false;
            }

            if (prevTab.appRefreshed) {
                return true;
            }

            const { urlParser } = props.deps;
            const urlChanged =
                prevTab.url && urlParser.areURLsEqual(prevTab.url, newTab.url) === false;

            return didTargetTabChanged(prevTab, newTab) || urlChanged === true;
        }

        function didTargetTabChanged(prevTab: PersistedTabInfo, newTab: Tab): boolean {
            return prevTab.id !== newTab.id;
        }
    },
);
