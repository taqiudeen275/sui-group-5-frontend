module suitter::like;

public struct Like has key, store {
    id: UID,
    user: address,
    created_at: u64
}

public fun create_like(ctx: &mut TxContext): Like {
    Like {
        id: object::new(ctx),
        user: ctx.sender(),
        created_at: tx_context::epoch_timestamp_ms(ctx)

    }
}
