import mongoose from "mongoose";
const habitSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: "",
        trim: true,
    },
    frequency: {
        type: String,
        enum: ["daily", "weekly"],
        default: "daily",
    },
    completedToday: {
        type: Boolean,
        default: false,
    },
    currentStreak: {
        type: Number,
        default: 0,
        min: 0,
    },
}, {
    timestamps: true,
});
const Habit = mongoose.models.Habit ||
    mongoose.model("Habit", habitSchema);
export default Habit;
//# sourceMappingURL=Habit.js.map