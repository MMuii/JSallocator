import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';

const commandsData = {
    malloc: {
        template: 'malloc <block-name> <size>',
        argsAmount: [2]
    },
    free: {
        template: 'free <block-name>',
        argsAmount: [1]
    },
    realloc: {
        template: 'realloc <block-name> <size>',
        argsAmount: [2]
    },
    info: {
        template: 'info <block-name>',
        argsAmount: [1]
    },
    heap: {
        template: 'heap clear or heap log <on/off>',
        argsAmount: [0, 1, 2],
        possibleArgs: ['clear', 'log', 'on', 'off']
    },
    size: {
        template: 'size fence <amount> or size struct <amount>',
        argsAmount: [2]
    },
    sizes: {
        template: 'sizes',
        argsAmount: [0]
    },
    help: {
        template: 'help',
        argsAmount: [0]
    },
    clear: {
        template: 'clear',
        argsAmount: [0]
    },
    undo: {
        template: 'undo',
        argsAmount: [0]
    },
    redo: {
        template: 'redo',
        argsAmount: [0]
    },
    address: {
        template: 'address <dec/hex>',
        argsAmount: [1],
        possibleArgs: ['dec', 'hex']
    },
    about: {
        template: 'about',
        argsAmount: [0]
    },
    github: {
        template: 'github',
        argsAmount: [0]
    }
}

const Terminal = ({ heap, sizes, settings, dispatch, terminal, log, clearTerminal }) => {
    const [text, setText] = useState('');
    const [focused, setFocused] = useState(false);
    const terminalRef = useRef();
    
    const address = num => (settings.addressBase === 'dec') ? num : '0x' + num.toString(16).toUpperCase(); 
 
    const logBlockTemplate = ({name, size, free, structStart, blockStart}) => [
        `name: ${name}`,
        `size: ${size}`,
        `free: ${free ? 'true' : 'false'}`,
        `control struct starts at address: ${address(structStart)}`,
        `allocated memory starts at address: ${address(blockStart)}`,
    ]

    const malloc = ([name, size]) => {
        if (!isNaN(name)) {
            log('Invalid argument. Block name must not be a number.');
            return;
        }

        if (isNaN(size)) {
            log('Invalid argument. Block size must be a valid number.');
            return;
        }

        if (size <= 0) {
            log('Invalid argument. Block size must be greater than 0.');
            return;
        }

        //dodany warunek !block.free - do stestowania
        if (heap.findIndex(block => block.name === name && !block.free) !== -1) {
            log('Pick different block name. There is already block with this name on the heap.');
            return;
        }

        dispatch({ type: 'MALLOC', payload: {
            name,
            size: parseInt(size),
            callback: msg => log(msg)
        }});
    }

    const free = ([name]) => {
        if (!isNaN(name)) {
            log('Invalid argument. Block name must not be a number.');
            return;
        }

        const blockToFree = heap[heap.findIndex(block => block.name === name)];
        if (!blockToFree) {
            log(`Invalid name. There is no block named ${name} on the heap.`);
            return;
        }

        dispatch({ type: 'FREE', payload: {
            blockToFree,
            callback: msg => log(msg)
        }})
    }

    const realloc = ([name, size]) => {
        if (!isNaN(name)) {
            log('Invalid argument. Block name must not be a number.');
            return;
        }

        if (isNaN(size)) {
            log('Invalid argument. Block size must be a valid number.');
            return;
        }

        if (size <= 0) {
            log('Invalid argument. Block size must be greater than 0.');
            return;
        }

        // const blockToRealloc = heap[heap.findIndex(block => block.name === name && !block.free)];
        const blockIndex = heap.findIndex(block => block.name === name && !block.free);
        const block = heap[blockIndex];
        if (!block) {
            log(`Invalid name. There is no block named ${name} on the heap.`);
            return;
        }

        if (size === block.size) {
            log(`Reallocating block named ${block.name} to the same size - nothing happens`);
            return;
        }

        if (size === '0') {
            dispatch({ type: 'FREE', payload: {
                blockToFree: block,
                callback: msg => log(msg)
            }});
            return;
        }

        dispatch({ type: 'REALLOC', payload: {
            blockIndex,
            size: parseInt(size),
            callback: msg => log(msg)
        }});
    }

    const info = ([name]) => {
        if (!isNaN(name)) {
            log('Invalid argument. Block name must not be a number.');
            return;
        }

        const block = heap[heap.findIndex(block => block.name === name)];
        if (!block) {
            log(`Invalid name. There is no block named ${name} on the heap.`);
            return;
        }

        log([
            `------------------`,
            ...logBlockTemplate(block),
            `------------------`
        ]);
    }

    const heapCommands = ([arg1, arg2]) => {
        if (!arg1) {
            if (heap.length > 0) log(['', '------------ Logging heap']);
            logHeap();
            return;
        }

        if (arg1 === 'clear') {
            log('Heap cleared');
            dispatch({ type: 'HEAP_CLEAR' });
            return;
        }

        if (arg1 === 'log') {
            log(`Heap logging ${arg2 === 'on' ? 'enabled' : 'disabled'}`);
            dispatch({
                type: 'CHANGE_SETTINGS',
                payload: { logging: arg2 === 'on' ? true : false }
            });
            return;
        }
    }

    const sizeCommands = ([arg1, arg2]) => {
        if (arg1 !== 'fence' && arg1 !== 'struct') {
            log(`Invalid argument. Type: size fence <amount> or size struct <amount>`);
            return;
        }

        if (isNaN(arg2)) {
            log('Invalid argument. Size must be a valid number.');
            return;
        }

        const key = arg1 === 'fence' ? 'FENCE_SIZE' : 'STRUCT_SIZE';
        // const type = arg1 === 'fence' ? 'CHANGE_FENCE_SIZE' : 'CHANGE_STRUCT_SIZE';

        dispatch({
            type: 'CHANGE_SIZE',
            payload: { [key]: Number(arg2) }
        });

        log([`Size of ${arg1} changed to ${arg2}`]);
    }

    const logHeap = () => {
        if (heap.length === 0) {
            log('Heap is empty');
            return;
        }

        heap.forEach(block => {
            log([
                ...logBlockTemplate(block),
                `------------------`
            ])
        });
    }

    const changeAddressBase = ([base]) => {
        dispatch({
            type: 'CHANGE_SETTINGS',
            payload: { addressBase: base }
        });

        log(`Changed number base of displayed memory addresses to ${base}.`);
    }

    const validateArgsAmount = (command, argsAmount) => {
        const commandData = commandsData[command];

        if (argsAmount < commandData.argsAmount[0]) {
            log([`Too few arguments. Type: ${commandData.template}`]);
            return false;
        } else if (argsAmount > commandData.argsAmount[commandData.argsAmount.length - 1]) {
            log([`Too many arguments. Type: ${commandData.template}`]);
            return false;
        }

        return true;
    }

    const validateArgs = (command, args) => {
        const commandData = commandsData[command];

        if (commandData.possibleArgs) {
            if (!args.every(arg => commandData.possibleArgs.indexOf(arg) !== -1)) {
                log(`Invalid argument. Type: ${commandData.template}`);
                return false;
            }
        }

        return true;
    }

    const processInput = () => {
        if (!text) {
            log('');
            setText('');
            return;
        }

        const input = text.trim().split(' ');
        const command = input[0];
        const args = input.slice(1, input.length);

        log(text);

        if (!(commandsData.hasOwnProperty(command))) {
            log(`Unknown command: ${command}`);
            setText('');
            return;
        }

        if (!validateArgsAmount(command, args.length)) {
            setText('');
            return;
        }

        if (!validateArgs(command, args)) {
            setText('');
            return;
        }

        switch (input[0]) {
            case 'malloc': 
                malloc(args);
                break;
            case 'free': 
                free(args);
                break;
            case 'realloc':
                realloc(args);
                break;
            case 'info': 
                info(args);
                break;
            case 'heap':
                heapCommands(args);
                break;
            case 'size':
                sizeCommands(args);
                break;
            case 'sizes':
                log([
                    'Sizes:',
                    `Fence size: ${sizes.FENCE_SIZE}`,
                    `Struct size: ${sizes.STRUCT_SIZE}`
                ])
                break;
            case 'clear': 
                clearTerminal();
                break;
            case 'undo':
                dispatch({ type: 'UNDO', payload: { callback: msg => log(msg) } });
                break;
            case 'redo':
                dispatch({ type: 'REDO', payload: { callback: msg => log(msg) } });
                break;
            case 'help': 
                log([
                    'Available commands:',
                    'malloc <block-name> <size> - allocates memory block of given size', 
                    'free <block-name> - frees memory block of given name',
                    'realloc <block-name> <size> - reallocates given block to a different size',
                    'info <block-name> - logs block properties',
                    'heap - logs heap state',
                    'heap clear - empties heap to default state', 
                    'heap log <on/off> - logs whole heap each time it changes',
                    'size fence <amount> - changes memory fence size',
                    'size struct <amount> - changes block control struct size',
                    'sizes - logs current fence and struct sizes',
                    '-------------------',
                    'clear - clears the terminal',
                    'undo - undoes last action',
                    'redo - redoes undid action',
                    'address <dec/hex> - changes number base of displayed memory addresses',
                    '-------------------',
                    'about - about the project', 
                    'github - opens project github page'
                ]);
                break;
            case 'address':
                changeAddressBase(args);
                break;
            case 'about': 
                log([
                    'Author: Marcin Świderek',
                    'Project repo: https://github.com/MMuii/JSallocator',
                    '',
                    'JSAllocator is a visualization of a really simple first-fit memory allocator.',
                    '',
                    'The idea for this project came after I wrote an implementation of memory allocator as a student project. While debugging the student project, I helped myself understand whats going on by drawing heap step by step in a spreadsheet. It worked, but it wasn\'t too effective. When I finally finished, I came up with idea to create a tool that would help people implementing similiar, simple allocators.',
                    '',
                    'My visualization works almost the same as the student project implementation I wrote - it uses first-fit allocation alghoritm. There are three main functions you can use: malloc, free and realloc. I skipped calloc, because it would work exactly like malloc. Below, I explain how these functions work.',
                    '',
                    'malloc - It iterates through heap and tries to find a freed block with smaller or equal size as the block user want to allocate. If it finds nothing, it simply allocates new block at the end of the heap.',
                    '',
                    'free - If the block to be freed is at the end of the heap, function removes it. If not, block is marked as free and function checks if there is another free block before or after freed block. If there are any, they are merged into one block.',
                    '',
                    'realloc - There are few cases when realloc finishes its job really quickly. If new size is equal to current reallocated block\'s size, realloc does exactly nothing. If new size is smaller, block size is simply changed to new, smaller size. Same thing happens when reallocated block is located at the end of the heap - it\'s size is changed to new size, and that\'s all. If none of these cases occurs, things are getting a little bit more complicated. Firstly, realloc checks if there is a free block after reallocated block with an equal or smaller size, than difference between new size and reallocated block\'s size. If there is such a block, then realloc "steals" some of its size and adds to reallocated block. And, finally, if none of the above happens, realloc works like malloc, allocating new block of desired size, and then frees previous block with free function.',
                ]);
                break;
            case 'github':
                window.open('https://github.com/MMuii/JSallocator', '_blank');
                break;
            default: 
                log('Unknown command: ' + text);
                break;
        }

        setText('');
    }

    useEffect(() => {
        if (settings.logging) {
            log(['', 'Heap:', '']);
            logHeap();
        }
    }, [heap]);

    useEffect(() => {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }, [terminal]);

    const renderTerminal = () => {
        return terminal.map((line, index) => {
            return (
                <div className="line" key={index}>
                    <pre><span>{'>'}</span>{line}</pre>
                </div>
            )
        });
    }

    return (
        <div className="terminal container" ref={terminalRef}>
            {renderTerminal()}
            <div className="input">
                <p className="marker">{'>'}</p>
                <input 
                    type="text" 
                    style={{ background: focused ? '#222' : '#292929'}}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && processInput()}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
            </div>
        </div>
    )
}

export default Terminal;
