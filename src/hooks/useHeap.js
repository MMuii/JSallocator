import { useReducer } from 'react';
import { useHistory } from './useHistory';
import _, { update } from 'lodash';

const reducer = (state, action) => {
    const { heap } = state;
    const { BLOCK_STRUCT_SIZE } = state.sizes;
    const { history } = action;

    const getBlockIndex = block => heap.findIndex(el => el.name === block.name);
    const updateStateWithHistory = changes => {
        const newState = { ...state, ...changes };
        history.push(_.cloneDeep(newState));
        return newState;
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

                return updateStateWithHistory({ heap: updatedHeap });
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

            return updateStateWithHistory({ heap: [...updatedHeap, newBlock] });
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
                } else return updateStateWithHistory({ heap: [] });

                return updateStateWithHistory({
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

                return updateStateWithHistory({ heap: updatedHeap });
            }
        }

        case 'REALLOC': {
            const { blockIndex, size } = action.payload;

            const updatedHeap = heap.slice();
            //const block = { ...updatedHeap[blockIndex] };
            const block = updatedHeap[blockIndex];

            //block is being reallocated to smaller size or next block doesnt exist
            //or there is a free, big enough gap between reallocated and its next block
            //in that scenarios all realloc has to do is just reducing block size
            if ((size < block.size || !block.next) ||
                (block.next.structAddressStart - block.blockAddressEnd) >= (size - block.size)) {
                console.log('Reallocating to smaller size or filling gap between blocks');
                block.size = size;
                block.blockAddressEnd = block.structAddressEnd + size;
                updatedHeap.splice(blockIndex, 1, block);

                return updateStateWithHistory({ heap: updatedHeap });
            }

            //next block from reallocated one is free, so realloc will try to subtract needed space from next block 
            //and add it to the reallocated one
            if (block.next.free) {
                const sizeDiff = size - block.size; //how many more bytes will be added to reallocated block's size
                const gap = block.next.structAddressStart - block.blockAddressEnd;
                // const nextBlock = { ...block.next };
                const nextBlock = block.next;
                const subtractedFromNext = sizeDiff - gap;

                if (nextBlock.size > subtractedFromNext) {
                    console.log('Reallocate with merge with next block');
                    block.size = size;
                    block.blockAddressEnd = block.structAddressEnd + size;

                    nextBlock.size -= subtractedFromNext;
                    nextBlock.structAddressStart = block.blockAddressEnd;
                    nextBlock.structAddressEnd = nextBlock.structAddressStart + BLOCK_STRUCT_SIZE;
                    nextBlock.blockAddressEnd = nextBlock.structAddressEnd + nextBlock.size;

                    updatedHeap.splice(blockIndex, 2, block, nextBlock);

                    return updateStateWithHistory({ heap: updatedHeap });
                } 
                
                else if (nextBlock.size === subtractedFromNext) { //zabiera cały size kolejnego bloku i go usuwa
                    console.log('Reallocate with merge with next block but next block freed');
                    const nextNextBlock = { ...nextBlock.next };

                    block.size = size;
                    block.blockAddressEnd = block.structAddressEnd + size;

                    block.next = nextNextBlock;
                    nextNextBlock.prev = block;

                    //deletes block, nextBlock and nextNext: [el, el, block, nextBlock, nextNextBlock, el, el]
                    //and adds new blocks in their place: [el, el, updatedBlock, updatedNextNextBlock, el, el]
                    updatedHeap.splice(blockIndex, 3, block, nextNextBlock);

                    return updateStateWithHistory({ heap: updatedHeap });
                }
            }

            console.log('Realloc mallocowal normalnie');

            action.dispatch({ 
                type: 'FREE', 
                history, 
                payload: { 
                    blockToFree: block, 
                    callback: action.payload.callback 
                }
            });

            action.dispatch({
                type: 'MALLOC',
                history,
                payload: {
                    name: block.name,
                    size,
                    callback: action.payload.callback
                }
            }); 

            return state;
        }

        case 'HEAP_CLEAR': {
            return updateStateWithHistory({ heap: [] });
        }

        case 'CHANGE_SETTINGS': {
            return updateStateWithHistory({
                settings: {
                    ...state.settings,
                    ...action.payload
                }
            });
        }

        case 'UNDO': {
            const prevState = history.undo();
            console.log('prevState', prevState);
            if (!prevState) {
                action.payload.callback('Cannot undo anymore');
                return state;
            }

            return prevState;
        }

        case 'REDO': {
            const nextState = history.redo();
            console.log('nextState', nextState);
            if (!nextState) {
                action.payload.callback('Cannot redo anymore');
                return state;
            }

            return nextState;
        }

        default:
            return state;
    }
}

const initialHeap = {
    heap: [],
    sizes: {
        HEAP_SIZE: 1024,
        BLOCK_STRUCT_SIZE: 32,
    },
    settings: {
        scale: .3,
        addressBase: 'dec',
        logging: false
    }
}

export const useHeap = () => {
    const [undo, redo, push, currentState] = useHistory(initialHeap);

    const [{ heap, sizes, settings }, dispatch] = useReducer(reducer, initialHeap);

    return [
        heap,
        { heap, sizes, settings }, //debug
        sizes,
        settings,
        ({ type, payload = {} }) => dispatch({ 
            type,
            history: { undo, redo, push, currentState }, 
            dispatch,
            payload: { 
                ...payload, 
            } 
        }) 
    ]
}