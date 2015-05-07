/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/knockout/knockout.d.ts" />
/// <reference path="typings/mousetrap/mousetrap.d.ts" />

interface IHaveValue{
  Value: number;
}

interface IHaveAttributes{
  Str: number;
  Dex: number;
  Con: number;
  Cha: number;
  Int: number;
  Wis: number;
}

interface StatBlock{
  Name: string;
  HP: IHaveValue;
  Attributes: IHaveAttributes;
}

interface Rules{
  CalculateModifier: (attribute:number) => number;
  AbilityCheck: (mods : number[]) => number;
}

class DefaultRules implements Rules {
  CalculateModifier = (attribute: number) =>
  {
    return Math.floor((attribute - 10) / 2);
  }
  AbilityCheck = (mods: number[]) => 
  {
    return Math.ceil(Math.random() * 20) + mods.reduce((p,c) => p + c);
  }
}

class Encounter {
  constructor(rules?: Rules){
    this.creatures = ko.observableArray<Creature>(); 
    this.SelectedCreature = ko.observable<Creature>();
    this.Rules = rules || new DefaultRules();
  }
  
  creatures: KnockoutObservableArray<Creature>;
  SelectedCreature: KnockoutObservable<Creature>;
  Rules: Rules;
  
  private sortByInitiative = () => {
    this.creatures.sort((l,r) => (r.Initiative() - l.Initiative()) || (r.InitiativeModifier - l.InitiativeModifier));
  }
  
  private relativeNavigateFocus = (offset: number) => 
  {
    var newIndex = this.creatures.indexOf(this.SelectedCreature()) + offset;
    if(newIndex < 0){ 
      newIndex = 0;
    } else if(newIndex >= this.creatures().length) { 
      newIndex = this.creatures().length - 1; 
    }
    this.SelectedCreature(this.creatures()[newIndex]);
  }
  
  private moveCreature = (creature: Creature, index: number) => 
  {
    this.creatures.remove(creature);
    this.creatures.splice(index,0,creature);
  }
  
  AddCreature = (creatureJson: StatBlock) => 
  {
    console.log("adding %O", creatureJson);
    this.creatures.push(new Creature(creatureJson, this));
  }
  
  SelectPreviousCombatant = () =>
  {
    this.relativeNavigateFocus(-1);
  }
  
  SelectNextCombatant = () =>
  {
    this.relativeNavigateFocus(1);
  }
  
  FocusSelectedCreatureHP = () =>
  {
    if(this.SelectedCreature()){
      this.SelectedCreature().FocusHP(true);
    }
    return false;
  }
  
  MoveSelectedCreatureUp = () =>
  {
    var creature = this.SelectedCreature();
    var index = this.creatures.indexOf(creature)
    if(creature && index > 0){
      this.moveCreature(creature, index - 1);
    }
  }
  
  MoveSelectedCreatureDown = () =>
  {
    var creature = this.SelectedCreature();
    var index = this.creatures.indexOf(creature)
    if(creature && index < this.creatures().length - 1){
      this.moveCreature(creature, index + 1);
    }
  }
  
  SelectedCreatureStatblock = () => this.SelectedCreature() 
                                  ? JSON.stringify(this.SelectedCreature().StatBlock, null, '\t') 
                                  : ""
  
  
  RollInitiative = () =>
  {
    this.creatures().forEach(c => { c.RollInitiative(); })
    this.sortByInitiative();
  }
}

class Creature{
  Name: string;
  Alias: KnockoutObservable<string>;
  MaxHP: number;
  CurrentHP: KnockoutObservable<number>;
  HPChange: KnockoutObservable<number>;
  InitiativeModifier: number;
  Initiative: KnockoutObservable<number>;
  StatBlock: StatBlock;
  Encounter: Encounter;
  FocusHP: KnockoutObservable<boolean>;
  constructor(creatureJson: StatBlock, encounter: Encounter, rules?: Rules){
    if(!creatureJson){
      throw "Couldn't create Creature- no Json passed in.";
    }
    this.Encounter = encounter;
    this.Name = creatureJson.Name;
    this.Alias = this.setAlias(this.Name);
    this.MaxHP = creatureJson.HP.Value;
    this.CurrentHP = ko.observable(creatureJson.HP.Value);
    this.HPChange = ko.observable(null);
    this.InitiativeModifier = this.Encounter.Rules.CalculateModifier(creatureJson.Attributes.Dex);
    this.Initiative = ko.observable(0);
    this.StatBlock = creatureJson;
    this.FocusHP = ko.observable(false);
  }
  
  private setAlias = (name: string) => {
    var others = this.Encounter.creatures().filter(c => c !== this && c.Name === name);
    if(others.length === 1){
      others[0].Alias(name + " 1")
    }
    
    return ko.observable(name + " " + (others.length + 1));
  }
  
  CommitHP = () => {
    this.CurrentHP(this.CurrentHP() - this.HPChange());
    this.HPChange(null);
    this.FocusHP(false);
  }
  GetHPColor = () => {
    var green = Math.floor((this.CurrentHP() / this.MaxHP) * 220);
    var red = Math.floor((this.MaxHP - this.CurrentHP()) / this.MaxHP * 255);
    return "rgb(" + red + "," + green + ",0)";
  }
  RollInitiative = () => {
    this.Initiative(this.Encounter.Rules.AbilityCheck([this.InitiativeModifier]));
  }
}

class ViewModel{
  constructor(){
    var self = this;
    this.encounter = ko.observable<Encounter>(new Encounter());
    this.creatures = ko.observableArray<Creature>();
  }
  encounter: KnockoutObservable<Encounter>;
  creatures: KnockoutObservableArray<Creature>;
}

function RegisterKeybindings(viewModel: ViewModel){
  Mousetrap.bind('j',viewModel.encounter().SelectNextCombatant);
  Mousetrap.bind('k',viewModel.encounter().SelectPreviousCombatant);
  Mousetrap.bind('t',viewModel.encounter().FocusSelectedCreatureHP);
  Mousetrap.bind('alt+r',viewModel.encounter().RollInitiative);
  Mousetrap.bind('alt+j',viewModel.encounter().MoveSelectedCreatureDown);
  Mousetrap.bind('alt+k',viewModel.encounter().MoveSelectedCreatureUp);
}

$(() => {
    var viewModel = new ViewModel();
    RegisterKeybindings(viewModel);
    ko.applyBindings(viewModel);
    $.getJSON('creatures.json', function(json){
    	viewModel.creatures(json);
    });
});