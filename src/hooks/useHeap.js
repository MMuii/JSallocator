import { useReducer } from 'react';

const reducer = (state, action) => {
    const { heap } = state;
    const { BLOCK_STRUCT_SIZE } = state.sizes;

    const getBlockIndex = block => heap.findIndex(el => el.name === block.name);
    const newHistoryEntry = ({ heap, sizes, settings }) => {
        // const historyEntry = { heap, sizes, settings };
        // const clone = Object.assign({}, historyEntry);
        // return clone;
        
        // return {
        //     heap, sizes, settings
        // }

        return Object.assign({}, heap, sizes, settings);
    }
    const updateStateWithHistory = newState => {
        return { 
            ...newState,
            history: [...state.history, newHistoryEntry(newState)],
            currentStateIndex: state.currentStateIndex + 1
        }
    }

    switch (action.type) {
        case 'MALLOC': {
            const { name, size, callback } = action.payload
            const updatedHeap = heap.slice();

            const freeBlock = heap.find(block => block.free && block.size >= size);
            if (freeBlock) {
                freeBlock.name = name;
                freeBlock.size = size;
                freeBlock.free = false;
                freeBlock.blockAddressEnd = freeBlock.structAddressEnd + freeBlock.size;

                callback(`Allocated block ${name} with size of ${size}.`);

                return updateStateWithHistory({
                    ...state,
                    heap: updatedHeap
                });
            }

            const lastBlock = updatedHeap[heap.length - 1];

            const structAddressStart = lastBlock ? lastBlock.blockAddressEnd : 0;
            const structAddressEnd = structAddressStart + BLOCK_STRUCT_SIZE;
            const blockAddressEnd = structAddressEnd + size;

            const newBlock = {
                name,
                prev: lastBlock ? lastBlock : null,
                next: null,
                size,
                free: false,
                structAddressStart,
                structAddressEnd,
                blockAddressEnd
            }

            if (lastBlock) lastBlock.next = newBlock;

            callback(`Allocated block ${name} with size of ${size}.`);

            return updateStateWithHistory({
                ...state,
                heap: [...updatedHeap, newBlock]
            });
        } 

        case 'FREE': {
            //TODO - uaktualnianie adresów przy mergowaniu 
            const { blockToFree, callback } = action.payload;

            if (blockToFree.free === true) {
                callback(`Block named ${blockToFree.name} is already free.`);
                return state;
            }

            callback(`Freed block named ${blockToFree.name}`);

            let updatedHeap = heap.slice();
            const cur = updatedHeap[getBlockIndex(blockToFree)];
            cur.free = true;
            cur.name += ' (freed)';

            const firstFree = (cur.prev && cur.prev.free) ? cur.prev : cur;
            const firstUsed = updatedHeap.find((block, index) => index > getBlockIndex(firstFree) && !block.free);

            if (!firstUsed) {
                if (firstFree.prev) {
                    firstFree.prev.next = null;
                } else {
                    return updateStateWithHistory({
                        ...state,
                        heap: []
                    });
                }

                return updateStateWithHistory({
                    ...state,
                    heap: updatedHeap.slice(0, updatedHeap.length - 1)
                });
            } else {
                firstFree.next = firstUsed;
                firstUsed.prev = firstFree;
                firstFree.size = firstUsed.structAddressStart - firstFree.structAddressEnd;
                firstFree.blockAddressEnd = firstUsed.structAddressStart;
                
                const firstFreeIndex = getBlockIndex(firstFree);
                const firstUsedIndex = getBlockIndex(firstUsed);

                updatedHeap = updatedHeap.filter((b, index) => index <= firstFreeIndex || index >= firstUsedIndex);

                return updateStateWithHistory({
                    ...state,
                    heap: updatedHeap
                });
            }
        }

        case 'HEAP_CLEAR': {
            return updateStateWithHistory({
                ...state,
                heap: []
            });
        }

        case 'CHANGE_SETTINGS': {
            return updateStateWithHistory({
                ...state,
                settings: {
                    ...state.settings,
                    ...action.payload
                }
            });
        }

        case 'UNDO': {
            const { history, currentStateIndex } = state;

            console.log('history', history);
            return state;

            // if (currentStateIndex === 0) {
            //     action.payload.callback('Cannot undo anymore');
            //     return state;
            // }

            // const prevState = history[currentStateIndex - 1];

            // return {
            //     ...prevState,
            //     history,
            //     currentStateIndex: currentStateIndex - 1
            // }
        }

        case 'REDO': {
            const { history, currentStateIndex } = state;

            if (currentStateIndex === history.length - 1) {
                action.payload.callback('Cannot redo anymore');
                return state;
            }

            const nextState = history[currentStateIndex + 1];

            return {
                ...nextState,
                history,
                currentStateIndex: currentStateIndex + 1
            }
        }

        default:
            return state;
    }
}

const initialHeap = {
    heap: [],
    sizes: {
        HEAP_SIZE: 1024,
        BLOCK_STRUCT_SIZE: 32
    },
    settings: {
        scale: .3,
        addressBase: 'dec',
        logging: false
    }
}

export const useHeap = () => {
    const [{ heap, history, currentStateIndex, sizes, settings }, dispatch] = useReducer(reducer, {
        ...initialHeap,
        history: [initialHeap],
        currentStateIndex: 0
    });

    return [
        heap,
        { heap, settings, history, currentStateIndex},
        sizes,
        settings,
        dispatch
    ]
}