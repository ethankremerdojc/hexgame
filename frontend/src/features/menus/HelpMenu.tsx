import { useState } from "react";

import {
  ElementSubType,
  MATERIAL_ELEMENT_SUBTYPES
} from "../board/boardTypes";

import { 
  THINGS_THAT_CAN_BE_BUILT, 
  getBuildingCost, 
  nameForElementSubType, 
  getSpecificItemBuildingCost,
  getDamageAmount,
  getArmorAmount,
  NO_FOOD_PENALTY,
  COMMON_SCAVENGABLE_ITEMS,
  RARE_SCAVENGABLE_ITEMS,
} from "../board/vars"
import { getSvgForSubType } from "../board/boardRenderer"

import "./HelpMenu.css";

function Ingredients() {

  return (
    <div className="ingredients-menu">
      <div className="ingredients-list">
        {
          THINGS_THAT_CAN_BE_BUILT.map(thing => {
            return (
              <div key={thing} className="build-item">
                <div className="thing-to-build">
                  <p>{nameForElementSubType(thing)}</p>
                  <img src={getSvgForSubType(thing, false)} />
                </div>
                <div className="ingredients">
                  {
                    getBuildingCost(thing).map(ing => {
                      return (
                          <div className="ingredient" key={ing.subType}>
                            <i>{nameForElementSubType(ing.subType)}</i>
                            <img src={getSvgForSubType(ing.subType, false)} />
                            <p>{getSpecificItemBuildingCost(thing, ing.subType)}</p>
                          </div>
                        )
                    })
                  }
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

function HowToPlay() {
  return (
    <div className="how-to-play">
      <h1>How To Play</h1>
      <div className="how-to-play-items">
        <h2>Goal</h2>
        <p>The goal of the game is to expand your colony, get lots of resources, and eventually wipe the other players off the map.</p>

        <h2>Tiles</h2>
        <p>Each tile (other than desert tile) produces one type of resource.</p>
        <ul>
          <li>Field: Food</li>
          <li>Forest: Wood</li>
          <li>Mountains: Ore</li>
          <li>Clay Deposit: Clay</li>
        </ul>
        <p>If you have one of your villagers on one of those tiles and make them 'work', they will produce 2 of that resource at the beginning of the next turn.</p>
        <p>If you then build a 'factory' building on that tile, each worker will produce 4 instead of 2.</p>
        <p>Here are the building types:</p>
        <ul>
          <li>Capital: Initial Building. Allows for 3 villagers to exist on your team.</li>
          <li>Village: Allows for an additional 2 villagers</li>
          <li>Farm: For producing food</li>
          <li>SawMill: For producing wood</li>
          <li>Brick Factory: For producing bricks</li>
          <li>Quarry: For producing Stone</li>
          <li>Forge: For making advanced weapons and armor</li>
        </ul>

        <h2>Villagers</h2>
        <p>Your villagers do everything. They are the method by which items are used, and battle is done.</p>
        <p>Each villager needs to have 1 food in their inventory or on the cell they are on each turn, or they will lose {NO_FOOD_PENALTY} health.</p>
        <p>Each villager's inventory space is 5, which includes horses and weapons etc.</p>
        <p>Each of your villagers can take one non-item and non health related action exportach turn.</p>
        <p>For example, your villager can take 2 food, drop 1 wood, then move, making it use it's action.</p>
        <p>Each villager has '2 hands' which determines which 'special items' that villager can hold.</p>
        <p>Here are all of the possible actions and their limitations/requirements.</p>
        
        <ul>
          <li>
            Move: Move to an adjacent tile.
          </li>
          <li>
            Take/Drop: Take or drop an item from the tile your villager is on. This includes horses and carts.<br />
            <br/>
            Limitations:
            <br/>
            You can not hold a horse and cart at the same time, you can not hold a bow and sword at the same time.<br />
            You can not hold a shield and bow, or any two of horse, cart or weapon.
          </li>
          <li>
            Fight: Deal damage to an enemy villager, then the enemy will also deal damage to your villager at the same time.<br />
            <ul>
              <li>Base Damage: {getDamageAmount(null)}</li>
              <li>Bow: Deals {getDamageAmount(ElementSubType.Bow)} damage. (Ignores Shield).<br /></li>
              <li>Spear: Deals {getDamageAmount(ElementSubType.Spear)} damage.<br /></li>
              <li>Leather Armor: Reduces damage by {getArmorAmount(ElementSubType.LeatherArmor)}.<br /></li>

              <li><b><u style={{color: "white"}}>Below require a 'forge'</u></b></li>
              <li>Sword: Deals {getDamageAmount(ElementSubType.Sword)} damage.<br /></li>
              <li>Mace: Deals {getDamageAmount(ElementSubType.Mace)} damage. (Ignores Leather armor)<br /></li>
              <li>Iron Armor: Reduces damage by {getArmorAmount(ElementSubType.IronArmor)}.<br /></li>
              <li>Shield: Reduces damage by {getArmorAmount(ElementSubType.Shield)}.<br /></li>
            </ul>
          </li>
          <li>
            Build: Build a structure or item with the items in your villagers inventory and on the ground.<br />
            There can not already be another structure there.
          </li>
          <li>
            Destroy: Destroy a structure at the tile you are on.
          </li>
          <li>
            Work: Cause your villager to work until the next turn, earning items.<br />
            Your villagers will automatically work if they didn't do any other actions.
          </li>
          <li>
            Heal: Heal by 1 health for 1 food. You can not heal if there is an enemy on the same cell as you.
          </li>
          <li>
            Clone: Create a new villager. This must be done either on a capital or a village, and requires 10 food.
          </li>
          <li>
            Trade: On a tile with a trader, trade any 2 of a resource for any 1 resource. You can also buy a horse for 7 of any one resource.
          </li>
          <li>
            Shoot: If your villager has a bow, they can do {getDamageAmount(ElementSubType.Bow)} damage to another villager in an adjacent tile, without having that villager do damage to them.<br/>
            Shooting ignores shields, but not armor.
          </li>
          <li>
            Scavenge: If your villager is in the desert, dig for a random item. <br/>
            Probabilities: 
            <ul className="scavengable-items">
              <li>75% chance to get one of ({MATERIAL_ELEMENT_SUBTYPES.map((item) => <b key={item}>{nameForElementSubType(item)}</b>)})</li>
              <li>18% chance to get one of ({COMMON_SCAVENGABLE_ITEMS.map((item) => <b key={item}>{nameForElementSubType(item)}</b>)})</li>
              <li>7% chance to get one of ({RARE_SCAVENGABLE_ITEMS.map((item) => <b key={item}>{nameForElementSubType(item)}</b>)})</li>
            </ul>
          </li>

        </ul>
        <h2>Special Items</h2>
        <ul>
          <li>
            Sword, Bow, Shield: Each require 1 hand to hold.
          </li>
          <li>
            Cart: Increases capacity for a villager holding it to 12. Requires 2 hands.
          </li>
          <li>
            Horse: If the first action of a villager riding a horse is 'Move', they can take another action. Requires 1 hand.
          </li>
          <li>
            Cow: Produces leather, can be purchased from trader. <br/>
            Produces 1 leather per cow if there is a working villager on the same tile, if the tile is either 'field' or 'forest'<br/>
            Requires 1 hand.<br/>
            If there are more than 3 cows on a particular tile, that tile will still only generate 3 leather.
          </li>
        </ul>

      </div>
    </div>
  )
}

export default function HelpMenu() {
  const [showIngredients, setShowIngredients] = useState(false);

  return (
    <div className="help-menu"><div className="help-menu-inner">
      <h1>Help</h1>
      <button className="help-type-toggle" onClick={() => {setShowIngredients(!showIngredients)}}>
        {
          !showIngredients ? "Ingredients Chart" : "How To Play"
        }
      </button>
      { showIngredients ? <Ingredients /> : <HowToPlay /> }
    </div></div>
  )
};
