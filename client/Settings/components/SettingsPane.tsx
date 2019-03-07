import { Formik } from "formik";
import _ = require("lodash");
import * as React from "react";
import { SubmitButton } from "../../Components/Button";
import { Tabs } from "../../Components/Tabs";
import { About } from "./About";

enum SettingsTab {
  About = "About",
  Commands = "Commands",
  Options = "Options",
  Account = "Account",
  EpicInitiative = "Epic Initiative"
}

const SettingsTabOptions = _.values<typeof SettingsTab>(SettingsTab);

interface SettingsPaneProps {
  repeatTutorial: () => void;
  reviewPrivacyPolicy: () => void;
  saveAndClose: () => void;
}
interface SettingsPaneState {
  currentTab: SettingsTab;
}

export class SettingsPane extends React.Component<
  SettingsPaneProps,
  SettingsPaneState
> {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: SettingsTab.About
    };
  }

  public render() {
    return (
      <Formik
        initialValues={{}}
        onSubmit={() => {}}
        render={props => (
          <form className="settings" onSubmit={props.handleSubmit}>
            <Tabs
              selected={this.state.currentTab}
              options={SettingsTabOptions}
              onChoose={tab => this.setState({ currentTab: tab })}
            />
            {this.getActiveTabContent()}
            <button
              type="submit"
              className="c-button save-and-close"
              onClick={this.props.saveAndClose}
            >
              Save and Close
            </button>
          </form>
        )}
      />
    );
  }

  private getActiveTabContent = () => {
    if (this.state.currentTab == SettingsTab.About) {
      return (
        <About
          repeatTutorial={this.props.repeatTutorial}
          reviewPrivacyPolicy={this.props.reviewPrivacyPolicy}
        />
      );
    }
  };
}