import { useState } from 'react';

const initialTerminal = [
    '       _   _____         _  _                     _               ',
    '      | | / ____|       | || |                   | |              ',
    '      | || (___    __ _ | || |  ___    ___  __ _ | |_  ___   _ __ ',
    '  _   | | \\___ \\  / _\` || || | / _ \\  / __|/ _\` || __|/ _ \\ | \`__|',
    ' | |__| | ____) || (_| || || || (_) || (__| (_| || |_| (_) || |   ',
    '  \\____/ |_____/  \\__,_||_||_| \\___/  \\___|\\__,_| \\__|\\___/ |_|   ',
    '',
    'JSallocator is a visualization of a really simple first-fit memory allocator.',
    '',
    'Use these commands to work with the allocator:',
    'malloc <block-name> <size> - allocates memory block of given size',
    'free <block-name> - frees memory block of given name',
    'realloc <block-name> <size> - reallocates given block to a different size',
    '',
    'To see all commands, type help'
]

// const initialTerminal = [
//     '    __  _____       _  _                 _             ',
//     ' __|  ||   __| ___ | || | ___  ___  ___ | |_  ___  ___ ',
//     '|  |  ||__   || .\'|| || || . ||  _|| .\'||  _|| . ||  _|',
//     '|_____||_____||__,||_||_||___||___||__,||_|  |___||_|  ',
//     // ' | |__| | ____) || (_| || || || (_) || (__| (_| || |_| (_) || |   ',
//     // '  \\____/ |_____/  \\__,_||_||_| \\___/  \\___|\\__,_| \\__|\\___/ |_|   ',
//     '',
//     'JSallocator is a visualization of a really simple first-fit memory allocator.',
//     '',
//     'Use these commands to work with the allocator:',
//     'malloc <block-name> <size> - allocates memory block of given size',
//     'free <block-name> - frees memory block of given name',
//     'realloc <block-name> <size> - reallocates given block to a different size',
//     '',
//     'To see all commands, type help'
// ]

export const useTerminal = () => {
    const [terminal, setTerminal] = useState(initialTerminal);

    return [
        terminal,
        msg => {
            Array.isArray(msg) 
                ? setTerminal(prevState => [...prevState, ...msg])
                : setTerminal(prevState => [...prevState, msg])
        },
        () => setTerminal([])
    ]
}