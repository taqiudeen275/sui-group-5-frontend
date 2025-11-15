module suitter::comment;
use std::string::String;

public struct Comment has key, store {
    id: UID,
    user: address,
    created_at: u64,
    content: String
}

public fun create_comment( content: String, ctx: &mut TxContext): Comment {
    Comment {
        id: object::new(ctx),
        user: tx_context::sender(ctx),
        created_at: tx_context::epoch_timestamp_ms(ctx),
        content
    }  
}