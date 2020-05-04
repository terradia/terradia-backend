import UnitModel from "../models/unit.model";

const units = [
  {
    id: "029d2554-7918-11ea-bc55-0242ac130003",
    name: "units.gram",
    notation: "g",
    referenceUnitId: "029d27c0-7918-11ea-bc55-0242ac130003",
    multiplicationFactor: 1000
  },
  {
    id: "029d27c0-7918-11ea-bc55-0242ac130003",
    name: "units.kilogram",
    notation: "kg",
    referenceUnitId: null,
    multiplicationFactor: null
  },
  {
    id: "029d29b4-7918-11ea-bc55-0242ac130003",
    name: "units.liter",
    notation: "L",
    referenceUnitId: null,
    multiplicationFactor: null
  },
  {
    id: "029d2b3a-7918-11ea-bc55-0242ac130003",
    name: "units.milliliter",
    notation: "mL",
    referenceUnitId: "029d29b4-7918-11ea-bc55-0242ac130003",
    multiplicationFactor: 1000
  },
  {
    id: "029d2c16-7918-11ea-bc55-0242ac130003",
    name: "units.centiliter",
    notation: "cL",
    referenceUnitId: "029d29b4-7918-11ea-bc55-0242ac130003",
    multiplicationFactor: 100
  },
];

export const upUnits: any = async () => {
  return UnitModel.bulkCreate(units);
};
export const downUnits: any = () =>
  UnitModel.destroy({ where: {} }).catch(err => {
    console.log(err);
  });