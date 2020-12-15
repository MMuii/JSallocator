# JSAllocator
## The idea
Idea for this project came after I wrote an implementation of memory allocator as a student project. While debugging the student project, I helped myself understand whats going on by drawing heap step by step in a spreadsheet. It worked, but it wasn't too effective. When I finally finished, I came up with idea to create a tool that would help people implementing similiar, simple allocators.

My visualization works almost the same as the student project implementation I wrote - it uses first-fit allocation alghoritm. There are three main functions you can use: malloc, free and realloc. I skipped calloc, because it would work exactly like malloc. Below, I explain how these functions work.

## Live demo
<http://mmuii.github.io/JSallocator>

## Core functionality
My visualization works almost the same as the student project I made - it uses first-fit allocation alghoritm. There are three main functions you can use: malloc, free and realloc. I skipped calloc, because it would work exactly like malloc. Below, I explain how these functions work. Besides of that, there are more usefull features, like displaying block addresses, both in dec or hex form.

## Available commands
You control whole app by typing commands in a terminal-looking window. Here are all the commands you can use:

**Available commands**:
- **malloc  <block-name> <size>** - allocates memory block of given size
- **free <block-name>** - frees memory block of given name
- **realloc <block-name> <size>** - reallocates given block to a different size
- **info <block-name>** - logs block properties
- **heap** - logs heap state
- **heap clear** - empties heap to default state
- **heap log <on/off>** - logs whole heap each time it changes
- **size fence <amount>** - changes memory fence size,
- **size struct <amount>** - changes block control struct size,
- **sizes** - logs current fence and struct sizes,
- **clear** - clears the terminal
- **undo** - undoes last action
- **redo** - redoes undid action
- **address <dec/hex>** - changes number base of displayed memory addresses
- **about** - about the project
- **github** - opens project github page

## Malloc, free and realloc algorithms
**malloc** - It iterates through heap and tries to find a freed block with smaller or equal size as the block user want to allocate. If it finds nothing, it simply allocates new block at the end of the heap.

**free** - If the block to be freed is at the end of the heap, function removes it. If not, block is marked as free and function checks if there is another free block before or after freed block. If there are any, they are merged into one block.

**realloc** - There are few cases when realloc finishes its job really quickly. If new size is equal to current reallocated block\'s size, realloc does exactly nothing. If new size is smaller, block size is simply changed to new, smaller size. Same thing happens when reallocated block is located at the end of the heap - it\'s size is changed to new size, and that\'s all. If none of these cases occurs, things are getting a little bit more complicated. Firstly, realloc checks if there is a free block after reallocated block with an equal or smaller size, than difference between new size and reallocated block\'s size. If there is such a block, then realloc "steals" some of its size and adds to reallocated block. And, finally, if none of the above happens, realloc works like malloc, allocating new block of desired size, and then frees previous block with free function.

## What are memory fences and control structs?
In my implementation of memory allocator each memory block has its control struct - a data structure that describes the block and contains informations like previous and next block, size of the block or knows if the block is free or not. Of course, control struct takes some space. I set it to 32 by default, but you can change it to any value by commands.

Memory fence are sets of bytes with predefined value, located directly before and after allocated user's space. They are usefull for checking if heap is corrupted. Mechanism is pretty simple - if you know the fence location, you can iterate through its bytes and check if their values are unchanged (equal to the predefined value). If not, something went wrong and fence corruption must have occured. 