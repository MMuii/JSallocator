import { useState } from "react";

export const useHistory = (initial) => {
    const [{ index, states }, setHistory] = useState({
        index: 0,
        states: [initial]
    });

    return [
        //undo
        () => {
            if (index <= 0) return null;

            setHistory({
                index: index - 1,
                states
            });

            return states[index - 1] || null;
        },
        //redo
        () => {
            if (index === states.length - 1) return null;

            setHistory({
                index: index + 1,
                states
            });

            return states[index + 1] || null;
        },
        //push
        (newState) => {
            let updatedStates = [...states.slice(0, index + 1), newState];
            const newIndex = updatedStates.length - 1;

            setHistory({
                index: newIndex,
                states: updatedStates
            });

            return states[index];
        },
        //current state
        states[index]
    ];
};
