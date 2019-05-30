import { StatBlock } from "../../common/StatBlock";
import { Encounter } from "../Encounter/Encounter";
import { InitializeSettings } from "../Settings/Settings";
import { TrackerViewModel } from "../TrackerViewModel";
import { CombatantCommander } from "./CombatantCommander";

describe("CombatantCommander", () => {
  let encounter: Encounter;
  let combatantCommander: CombatantCommander;
  let trackerViewModel: TrackerViewModel;
  beforeEach(() => {
    window["$"] = require("jquery");
    window.confirm = () => true;
    InitializeSettings();

    const mockIo: any = {
      on: jest.fn(),
      emit: jest.fn()
    };

    trackerViewModel = new TrackerViewModel(mockIo);
    encounter = trackerViewModel.Encounter;
    combatantCommander = trackerViewModel.CombatantCommander;
  });

  test("Apply Damage", () => {
    encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: { Value: 10 }
    });
    const combatantViewModel = trackerViewModel.OrderedCombatants()[0];
    expect(combatantViewModel.HP()).toEqual("10/10");
    combatantViewModel.ApplyDamage("5");
    expect(combatantViewModel.HP()).toEqual("5/10");
  });

  test("Toggle Hidden", () => {
    encounter.AddCombatantFromStatBlock(StatBlock.Default());
    const combatantViewModel = trackerViewModel.OrderedCombatants()[0];

    const playerViewBeforeToggle = encounter.GetPlayerView();
    expect(playerViewBeforeToggle.Combatants).toHaveLength(1);

    combatantCommander.Select(combatantViewModel);
    combatantCommander.ToggleHidden();
    const playerView = encounter.GetPlayerView();

    expect(playerView.Combatants).toHaveLength(0);
  });

  test("Toggle Reveal AC", () => {
    encounter.AddCombatantFromStatBlock(StatBlock.Default());
    const combatantViewModel = trackerViewModel.OrderedCombatants()[0];

    const playerViewBeforeToggle = encounter.GetPlayerView();
    expect(playerViewBeforeToggle.Combatants[0].AC).toBeUndefined();

    combatantCommander.Select(combatantViewModel);
    combatantCommander.ToggleRevealedAC();
    const playerView = encounter.GetPlayerView();

    expect(playerView.Combatants[0].AC).toBe(10);
  });

  test("Should maintain selection when initiative order changes", () => {
    const combatant1 = encounter.AddCombatantFromStatBlock(StatBlock.Default());
    const combatant2 = encounter.AddCombatantFromStatBlock(StatBlock.Default());

    combatant1.Initiative(15);
    combatant2.Initiative(10);
    encounter.SortByInitiative(false);

    expect(trackerViewModel.OrderedCombatants()[0].Combatant).toBe(combatant1);

    const combatantViewModel = trackerViewModel.OrderedCombatants()[0];
    expect(combatantViewModel.Combatant).toBe(combatant1);

    combatantCommander.Select(combatantViewModel);
    combatantViewModel.ApplyInitiative("5");

    expect(trackerViewModel.OrderedCombatants()[1].Combatant).toBe(combatant1);

    expect(combatantCommander.SelectedCombatants()[0]).toBe(
      trackerViewModel.OrderedCombatants()[1]
    );
  });

  test("Should remove selected", () => {
    const combatant1 = encounter.AddCombatantFromStatBlock(StatBlock.Default());
    const combatant2 = encounter.AddCombatantFromStatBlock(StatBlock.Default());

    const combatantViewModel = trackerViewModel.OrderedCombatants()[0];
    const playerView = encounter.GetPlayerView();
    expect(playerView.Combatants).toHaveLength(2);
    combatantCommander.Select(combatantViewModel);
    combatantCommander.Remove();
    const playerViewAfterRemove = encounter.GetPlayerView();
    expect(playerViewAfterRemove.Combatants).toHaveLength(1);
  });
  test("Should deselect", () => {
    const combatant1 = encounter.AddCombatantFromStatBlock(StatBlock.Default());

    const combatantViewModel = trackerViewModel.OrderedCombatants()[0];
    combatantCommander.Select(combatantViewModel);
    expect(combatantCommander.SelectedCombatants).toHaveLength(1);
    combatantCommander.Deselect();
    expect(combatantCommander.SelectedCombatants).toHaveLength(0);
  });
  test("Should edit the HP on combatants", () => {
    const combatant1 = encounter.AddCombatantFromStatBlock({
      ...StatBlock.Default(),
      HP: 10
    });

    const combatantViewModel = trackerViewModel.OrderedCombatants()[0];
    const playerView = encounter.GetPlayerView();
    expect(combatantViewModel.HP()).toEqual("10/10");
    combatantCommander.Select(combatantViewModel);
    combatantCommander.EditHP();
    console.log();
  });
});
