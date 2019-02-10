import * as React from "react";

import _ = require("lodash");
import { PlayerViewCombatantState } from "../../../common/PlayerViewCombatantState";
import { PlayerViewState } from "../../../common/PlayerViewState";
import { CustomStyles } from "./CustomStyles";
import { PlayerViewCombatant } from "./PlayerViewCombatant";
import { PlayerViewCombatantHeader } from "./PlayerViewCombatantHeader";
import { PortraitModal } from "./PortraitModal";

interface LocalState {
  showPortrait: boolean;
  modalURL: string;
  modalCaption: string;
}

export class PlayerView extends React.Component<PlayerViewState, LocalState> {
  private modalTimeout: number;

  constructor(props) {
    super(props);
    this.state = {
      showPortrait: false,
      modalURL: "",
      modalCaption: ""
    };
  }

  public render() {
    return (
      <div className="c-player-view">
        <CustomStyles
          CustomCSS={this.props.settings.CustomCSS}
          CustomStyles={this.props.settings.CustomStyles}
        />
        {this.state.showPortrait && (
          <PortraitModal
            imageURL={this.state.modalURL}
            caption={this.state.modalCaption}
            onClose={this.closePortrait}
          />
        )}
        <PlayerViewCombatantHeader showPortrait={this.hasImages()} />
        <ul className="combatants">
          {this.props.encounterState.Combatants.map(combatant => (
            <PlayerViewCombatant
              showPortrait={this.showPortrait}
              combatant={combatant}
              areSuggestionsAllowed={this.props.settings.AllowPlayerSuggestions}
              isPortraitVisible={this.props.settings.DisplayPortraits}
              isActive={
                this.props.encounterState.ActiveCombatantId == combatant.Id
              }
              key={combatant.Id}
            />
          ))}
        </ul>
      </div>
    );
  }

  public componentDidUpdate(prevProps: PlayerViewState) {
    this.handleSplashPortrait(prevProps.encounterState.ActiveCombatantId);
  }

  private handleSplashPortrait(newActiveCombatantId) {
    if (!this.props.settings.SplashPortraits) {
      return;
    }

    const newCombatantIsActive =
      newActiveCombatantId != this.props.encounterState.ActiveCombatantId;

    if (!newCombatantIsActive) {
      return;
    }

    const newActiveCombatant = _.find(
      this.props.encounterState.Combatants,
      c => c.Id == this.props.encounterState.ActiveCombatantId
    );

    if (newActiveCombatant && newActiveCombatant.ImageURL.length) {
      this.setState({
        modalURL: newActiveCombatant.ImageURL,
        modalCaption: newActiveCombatant.Name,
        showPortrait: true
      });
      this.modalTimeout = window.setTimeout(this.closePortrait, 5000);
    }
  }

  private showPortrait = (combatant: PlayerViewCombatantState) => {
    if (!combatant.ImageURL) {
      return;
    }

    window.clearTimeout(this.modalTimeout);
    this.setState({
      modalURL: combatant.ImageURL,
      modalCaption: combatant.Name,
      showPortrait: true
    });
  };

  private closePortrait = () => {
    this.setState({
      showPortrait: false
    });
  };

  private hasImages = () => {
    return (
      this.props.settings.DisplayPortraits &&
      this.props.encounterState.Combatants.some(c => c.ImageURL.length > 0)
    );
  };
}