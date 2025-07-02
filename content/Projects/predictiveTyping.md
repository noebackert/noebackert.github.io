---
title: "Predictive typing software in C"
date: "2023-04-01"
author: "Noé Backert, Antoine Banchet"
description: "Implementation of a predictive typing program in C using hash tables and trie data structures to suggest next words in real time based on word frequency and user input."
---

### Hash based predictive algorithm for typing

## Project Details
- **Project Type**: Programmation in C
- **Tools**: C, git
- **Duration**: 2 weeks
- **Team**: Duo project with Antoine Banchet

--- 
## Introduction
The goal of this project is to develop a predictive typing software in C. The software will predict the next word based on the first characters typed by the user. The software will use a hash table to store the words and their frequency in a text file. The software will be able to predict the next word based on the frequency of the words in the text file.

--- 

## Project Overview
The project involves:

- Developing in C

- Using a hash table to store the words and their frequency in a file

- Predicting the next word based on the frequency of the words in the text file in real time

--- 

### General Description of the Project
The project focuses on developing a predictive text algorithm using a trie data structure. This trie has nodes with 27 children: 26 for each letter of the alphabet and one for special characters, represented by the symbol #. The algorithm works by traversing the trie from the root, following the letters of the input word sequentially. Nodes with a weight of 0 indicate that the traversal has not reached the end of a word, while nodes with a positive weight denote the end of a word and its significance. This structure enables the predictive text algorithm to suggest relevant words to users in real-time based on their input.

<div class="figure" style="text-align:center;">
  <img src="/img/projects/predictiveTyping/Trie.png" alt="predictiveTyping" style="max-width:100%;height:auto;">
  <p>Figure 1: Illustration demonstrating how a trie sort can aid in identifying which letters are more frequently used in known words.</p>
</div>

--- 

## Libraries
```c
// hash.h
void initializeHashTable(HashTable *hashTab);
// Initializes an empty hash table

void loadDictionaryFromFile(HashTable* hashTab, const char* dictionaryFileName);
// Loads a dictionary from a file and adds it to the hash table

void insertElementToHashTable(HashTable* hashTab, char* word);
// Inserts an element into the hash table

bool checkExistenceWordInDictionary(HashTable* hashTab, char * word);
// Checks if a word exists in the hash table

unsigned long getHashValue(char *string);
// Computes the hash value of a string
```
The library hash.h implements a hash table for storing and searching words in nearly constant time. It uses a linked list to handle collisions.


```c
// trie.h
void initialize_trie(Trie *root);
// Initializes an empty prefix tree (trie)

void add_word(Trie *root, char *word);
// Adds a word to the prefix tree (trie)

void create_trie(Trie *trie, char *fileName);
// Loads a dictionary from a file and stores it in a prefix tree (trie)

void print_trie(Trienode* node, char* str, int level);
// Prints the prefix tree (trie)

void print_trie_graph(Trienode* node, int level, FILE *file);
// Prints the prefix tree (trie) in graphical form

List suggest_words(Trie* trie, char* prefix);
// Suggests words starting with a given prefix and returns a linked list of suggested words

void serialize_trie(Trienode *root, FILE *file);
// Serializes a Trie tree by writing its nodes into a binary file

Trienode* deserialize_trie(FILE *file);
// Deserializes a Trie tree from a binary file and returns a pointer to its root

void save_trie(Trie *trie);
// Saves a trie structure into a binary file using serialize_trie()

void load_trie(Trie *trie);
// Loads a prefix tree (trie) from a binary file
```
The library trie.h implements a prefix tree (trie) for storing and searching words. Tries are also known as prefix trees.

```c
typedef struct trienode
{
    char letter;
    int weight;
    struct trienode *child[27];
} Trienode;

typedef struct trie
{
    Trienode *root;
} Trie;
```

The trie structure enables a predictive text algorithm. Each node in this tree contains 27 children: 26 for each letter of the alphabet and the 27th for managing special characters, represented by the symbol #.

The algorithm operates by traversing the trie from the root, following each letter of the input word one by one. If a node has a weight of 0, it indicates that it's not the end of a word. Conversely, if the node's weight is greater than 0, it signifies the end of a word and its importance.

This trie structure allows the predictive text algorithm to suggest relevant words to the user in real-time, based on the letters they input.

### Description of necessary functions

```c
// Function create_node
Trienode *create_node(char letter)
{
    Trienode *newnode = (Trienode*) malloc(sizeof(Trienode));

    for (int i = 0; i < 27; i++)
    {
        newnode->child[i] = NULL;
    }

    newnode->letter = letter;
    newnode->weight = 0;
    return newnode;
}
``` 
This function create_node creates a new node in a trie tree. It takes a character "letter" as input, which will be stored in the newly created node. The function initializes all children to NULL and sets the weight to 0.


```c
// Function add_word
void add_word(Trie *trie, char *word)
{
    Trienode* current = trie->root;
    while((*word) != '\0')
    {
        int index = *word - 'a'; // ASCII difference
        if ((*word) < 97 || (*word) >  122)
        {
            index = 27;
            *word = '#';
        }
        if (current->child[index] == NULL)
        {
            current->child[index] = create_node(*word);
        }
        current = current->child[index];  
        word++;
    }
    current->weight++;
}
``` 
The add_word function traverses the word character by character and creates nodes for each letter of the word. If a node for that letter does not yet exist, it is created and placed in the "child" array of the current node. The "weight" field of the last created node is then incremented to indicate that this node marks the end of a word and to assign its weight.


```c
// Function create_trie
void create_trie(Trie *trie, char *fileName)
{
    FILE *file;
    file = fopen(fileName, "r");

    if (file != NULL)
    {
        char word[MAX_WORD_LENGHT];
        while (fscanf(file, "%s", word) >= 1)
        {
            add_word(trie, word);
        }
    }
    else
    {
        printf("Le fichier n'a pas été trouvé.");
    }
    fclose(file);
}
```
This function reads a text file and adds each word to the trie.


```c
// Function suggest_words
List suggest_words(Trie* trie, char* prefix)
{
    List liste_mots;
    initializeList(&liste_mots);

    Trienode* current = trie->root;
    char prefix_copy[strlen(prefix)];
    strcpy(prefix_copy, prefix);
    prefix_copy[strlen(prefix) - 1] = '\0';

    while ((*prefix) != '\0')
    {
        int index = *prefix - 'a'; 
        if ((*prefix) < 97 || (*prefix) >  122)
        {
            index = 27;
        }
        if (current->child[index] == NULL)
        {
            printf("Le préfixe n'existe pas dans le dictionnaire.\n");
            return liste_mots;
        }
        current = current->child[index];  
        prefix++;
    }
    char buffer[100];
    search_prefix(current, prefix_copy, buffer, 0, &liste_mots);
    triFusion(&liste_mots);

    return liste_mots;
}
```
The suggest_words function is central to the program. It takes a prefix and a trie tree containing words as inputs. It searches for all words in the dictionary that start with this prefix by traversing the trie tree from the root to the last node corresponding to the prefix's last letter. Then, it uses a search function to find all words following this prefix and stores them in a linked list, which it sorts before returning.


```c
// Functions for saving/loading trie
void serialize_trie(Trienode *root, FILE *file);
Trienode* deserialize_trie(FILE *file);
void save_trie(Trie *trie);
void load_trie(Trie *trie);
```
These functions allow saving and loading the trie structure from a binary file.

## Conclusion
In conclusion, the predictive typing software developed in C is a powerful tool that can predict the next word based on the frequency of words in a text file. The software uses a hash table to store the words and their frequency and a trie data structure to predict the next word based on the user's input. The software is efficient and can predict the next word in real time.

However, today these types of software are not used anymore because of the power of modern computers and the use of machine learning.


