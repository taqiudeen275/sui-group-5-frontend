module suitter::suitter;

use std::string::String;
use sui::table::{Self, Table};
use suitter::comment;
use suitter::like;
use sui::event;
use sui::display;
use sui::package;

const LIKE_ALREADY_ERROR: u64 = 1;
const NOT_LIKE_ERROR: u64 = 2;
// 
public struct Suit has key, store{
    id: UID,
    body: String,
    created_at: u64
}


public struct SuiStore has key, store {
    id: UID,
    suit: ID,
    comments: Table<ID, bool>,
    repost: Table<ID, bool>,
    likes: Table<address, ID>,
    created_at: u64

}


// Events

public struct SuitCreated has copy, drop{
    suit_store_id: ID,
    created_at: u64,
    author: address
}

public struct ReSuited has copy, drop{
    suit_store_id: ID,
    re_suited_at: u64,
    re_suitor: address
}

public struct SuitLiked has copy, drop{
    suit_store_id: ID,
    like_id: ID,
    liked_at: u64,
    liker: address
}

public struct SuitUnliked has copy, drop{
    suit_store_id: ID,
    like_id: ID,
    unliked_at: u64,
    unliker: address
}

public struct SuitCommented has copy, drop{
    suit_store_id: ID,
    comment_id: ID,
    commented_at: u64,
    commenter: address,
    comment: String
}

public struct SUITTER has drop {}
// init
fun init(otw: SUITTER,ctx: &mut TxContext) {
    let publisher = package::claim(otw, ctx);

    let suit_store_keys = vector[
     b"suit".to_string(),
     b"comments".to_string(),
     b"repost".to_string(),
     b"likes".to_string(),
     b"created_at".to_string()
    ];
    let suit_store_values = vector[
        b"{suit}".to_string(),
        b"comments".to_string(),
        b"repost".to_string(),
        b"likes".to_string(),
        b"{created_at}".to_string()
    ];

    let mut display = display::new_with_fields<SuiStore>(&publisher,suit_store_keys, suit_store_values,ctx);
    
    display.update_version();

    transfer::public_transfer(publisher, ctx.sender());
    transfer::public_transfer(display, ctx.sender());
}

// public functions

public fun create_suit(body: String, ctx: &mut TxContext): Suit {
    let suit = Suit {
        id: object::new(ctx),
        body: body,
        created_at: tx_context::epoch_timestamp_ms(ctx)
    };
    let suit_id = object::id(&suit);
    let suit_store = SuiStore {
        id: object::new(ctx),
        suit: suit_id,
        comments: table::new(ctx),
        repost: table::new(ctx),
        likes: table::new<address, ID>(ctx),
        created_at: tx_context::epoch_timestamp_ms(ctx)

    };
    event::emit(SuitCreated {
        suit_store_id: suit_id,
        created_at: tx_context::epoch_timestamp_ms(ctx),
        author: ctx.sender()
    });
    transfer::share_object(suit_store);
    return suit
}

entry fun  create_and_keep_suit(body: String, ctx: &mut TxContext){
   let suit = create_suit(body,  ctx);
   transfer::public_transfer(suit, ctx.sender());
}

entry fun create_and_keep_comment(text: String, suit_store: &mut SuiStore, ctx: &mut TxContext){
    let comment = comment::create_comment(text,  ctx);
    let comment_id = object::id(&comment);
    suit_store.comments.add(comment_id, true);
    let store_id = object::id(suit_store);
    event::emit(SuitCommented {
        suit_store_id: store_id,
        comment_id: comment_id,
        commented_at: tx_context::epoch_timestamp_ms(ctx),
        commenter: ctx.sender(),
        comment: text
    });
    transfer::public_transfer(comment, ctx.sender());
    
}


entry fun create_and_keep_like(suit_store: &mut SuiStore, ctx: &mut TxContext){
    assert!(!suit_store.likes.contains(ctx.sender()), LIKE_ALREADY_ERROR);
    let like = like::create_like(ctx);
    let like_id = object::id(&like);
    suit_store.likes.add(ctx.sender(), like_id);

    event::emit(SuitLiked {
        suit_store_id: suit_store.suit,
        like_id: like_id,
        liked_at: tx_context::epoch_timestamp_ms(ctx),
        liker: ctx.sender()
    });
    transfer::public_transfer(like, ctx.sender());
}

entry fun unlike_suit(suit_store: &mut SuiStore,ctx: &mut TxContext){
    assert!(suit_store.likes.contains(ctx.sender()), NOT_LIKE_ERROR);
    let like_id = suit_store.likes.remove(ctx.sender());
    let suit_id = object::id(suit_store);
    event::emit(SuitUnliked {
        suit_store_id: suit_id,
        like_id: like_id,
        unliked_at: tx_context::epoch_timestamp_ms(ctx),
        unliker: ctx.sender()
    });
}

public fun repost_suit(original_suit: &Suit,original_suit_store: &mut SuiStore, ctx: &mut TxContext): (Suit, SuiStore) {
    let reposted_suit = Suit {
        id: object::new(ctx),
        body: original_suit.body,
        created_at: tx_context::epoch_timestamp_ms(ctx)
    };
    let reposted_suit_id = object::id(&reposted_suit);

    let reposted_suit_store = SuiStore {
        id: object::new(ctx),
        suit: reposted_suit_id,
        comments: table::new(ctx),
        likes: table::new(ctx),
        created_at: tx_context::epoch_timestamp_ms(ctx),
        repost: table::new(ctx)
    };
    let reposted_suit_store_id = object::id(&reposted_suit_store);
    event::emit(ReSuited {
        suit_store_id: reposted_suit_store_id,
        re_suited_at: tx_context::epoch_timestamp_ms(ctx),
        re_suitor: ctx.sender()
    });
    original_suit_store.repost.add(reposted_suit_id, true);
    return (reposted_suit, reposted_suit_store)
}

entry fun repost_and_keep_suit(original_suit: &Suit, original_suit_store: &mut SuiStore, ctx: &mut TxContext) {
    let (reposted_suit, reposted_suit_store) = repost_suit(original_suit, original_suit_store,  ctx);
    transfer::transfer(reposted_suit, ctx.sender());
    transfer::transfer(reposted_suit_store, ctx.sender());

}


