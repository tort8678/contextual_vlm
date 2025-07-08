import mongoose, { Schema } from "mongoose";

export interface treeInterface {
    location: {
        type: "Point";
        coordinates: [number, number];
    };
}

const TreeSchema = new Schema<treeInterface>({
    location: {
        type: { type: String, enum: ["Point"], required: true },
        coordinates: { type: [Number], required: true }
    }
});
TreeSchema.index({ location: "2dsphere" });

export const TreeModel = mongoose.model<treeInterface>("trees", TreeSchema, "trees");

// Repeat for sidewalkMaterialInterface and pedestrianRampInterface:
export interface sidewalkMaterialInterface {
    location: {
        type: "Point";
        coordinates: [number, number];
    };
    material: string;
}

const SidewalkMaterialSchema = new Schema<sidewalkMaterialInterface>({
    location: {
        type: { type: String, enum: ["Point"], required: true },
        coordinates: { type: [Number], required: true }
    },
    material: { type: String, required: true }
});
SidewalkMaterialSchema.index({ location: "2dsphere" });

export const SidewalkMaterialModel = mongoose.model<sidewalkMaterialInterface>("sidewalk_material", SidewalkMaterialSchema, "sidewalk_material");

export interface pedestrianRampInterface {
    location: {
        type: "Point";
        coordinates: [number, number];
    };
}

const PedestrianRampSchema = new Schema<pedestrianRampInterface>({
    location: {
        type: { type: String, enum: ["Point"], required: true },
        coordinates: { type: [Number], required: true }
    }
});
PedestrianRampSchema.index({ location: "2dsphere" });

export const PedestrianRampModel = mongoose.model<pedestrianRampInterface>("pedestrian_ramps", PedestrianRampSchema, "pedestrian_ramps");