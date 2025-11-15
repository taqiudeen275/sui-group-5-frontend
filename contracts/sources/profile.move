module suitter::profile;

use std::string::String;
use sui::table::{Self, Table};

// public struct ProfileCreated has copy, drop{
//     profile_id: ID,
//     updated_at: u64,
//     updater: address
// }


// Error codes
const EPROFILE_ALREADY_EXISTS: u64 = 1;
const EUSERNAME_ALREADY_TAKEN: u64 = 2;
const ENOT_PROFILE_OWNER: u64 = 3;

/// User profile struct that stores profile information
public struct Profile has key, store {
    id: UID,
    owner: address,
    username: String,
    bio: String,
    profile_image_url: String, // Can store URL or Object ID
    created_at: u64,
    updated_at: u64
}

/// Global registry to track profiles and ensure unique usernames
public struct ProfileRegistry has key {
    id: UID,
    profiles: Table<address, ID>, // Maps wallet address to Profile ID
    usernames: Table<String, address> // Maps username to wallet address
}

/// Initialize the profile registry (called once during module deployment)
fun init(ctx: &mut TxContext) {
    let registry = ProfileRegistry {
        id: object::new(ctx),
        profiles: table::new(ctx),
        usernames: table::new(ctx)
    };
    transfer::share_object(registry);
}

/// Create a new profile
public fun create_profile(
    registry: &mut ProfileRegistry,
    username: String,
    bio: String,
    profile_image_url: String,
    ctx: &mut TxContext
): Profile {
    let sender = ctx.sender();
    
    // Check if profile already exists for this address
    assert!(!registry.profiles.contains(sender), EPROFILE_ALREADY_EXISTS);
    
    // Check if username is already taken
    assert!(!registry.usernames.contains(username), EUSERNAME_ALREADY_TAKEN);
    
    
    let profile = Profile {
        id: object::new(ctx),
        owner: sender,
        username,
        bio,
        profile_image_url,
       created_at: tx_context::epoch_timestamp_ms(ctx),
    updated_at: tx_context::epoch_timestamp_ms(ctx)
    };
    
    let profile_id = object::id(&profile);
    
    // Register the profile
    registry.profiles.add(sender, profile_id);
    registry.usernames.add(profile.username, sender);
    

    profile
}

/// Entry function to create and transfer profile to sender
entry fun create_and_keep_profile(
    registry: &mut ProfileRegistry,
    username: String,
    bio: String,
    profile_image_url: String,
    ctx: &mut TxContext
) {
    let profile = create_profile(registry, username, bio, profile_image_url, ctx);
    transfer::public_transfer(profile, ctx.sender());
}

/// Update profile bio
public fun update_bio(
    profile: &mut Profile,
    new_bio: String,
    ctx: &TxContext
) {
    assert!(profile.owner == ctx.sender(), ENOT_PROFILE_OWNER);
    profile.bio = new_bio;
    profile.updated_at = tx_context::epoch_timestamp_ms(ctx);
}

/// Update profile image
public fun update_profile_image(
    profile: &mut Profile,
    new_image_url: String,
    ctx: &TxContext
) {
    assert!(profile.owner == ctx.sender(), ENOT_PROFILE_OWNER);
    profile.profile_image_url = new_image_url;
    profile.updated_at = tx_context::epoch_timestamp_ms(ctx);
}

/// Update username (requires registry to check uniqueness)
public fun update_username(
    registry: &mut ProfileRegistry,
    profile: &mut Profile,
    new_username: String,
    ctx: &TxContext
) {
    assert!(profile.owner == ctx.sender(), ENOT_PROFILE_OWNER);
    assert!(!registry.usernames.contains(new_username), EUSERNAME_ALREADY_TAKEN);
    
    // Remove old username mapping
    registry.usernames.remove(profile.username);
    
    // Add new username mapping
    registry.usernames.add(new_username, profile.owner);
    
    // Update profile
    profile.username = new_username;
    profile.updated_at = tx_context::epoch_timestamp_ms(ctx);
}

/// Entry function to update bio
entry fun update_profile_bio(
    profile: &mut Profile,
    new_bio: String,
    ctx: &TxContext
) {
    update_bio(profile, new_bio, ctx);
}

/// Entry function to update profile image
entry fun update_profile_image_url(
    profile: &mut Profile,
    new_image_url: String,
    ctx: &TxContext
) {
    update_profile_image(profile, new_image_url, ctx);
}

/// Entry function to update username
entry fun update_profile_username(
    registry: &mut ProfileRegistry,
    profile: &mut Profile,
    new_username: String,
    ctx: &TxContext
) {
    update_username(registry, profile, new_username, ctx);
}

// Getter functions
public fun get_owner(profile: &Profile): address {
    profile.owner
}

public fun get_username(profile: &Profile): String {
    profile.username
}

public fun get_bio(profile: &Profile): String {
    profile.bio
}

public fun get_profile_image_url(profile: &Profile): String {
    profile.profile_image_url
}

public fun get_created_at(profile: &Profile): u64 {
    profile.created_at
}

public fun get_updated_at(profile: &Profile): u64 {
    profile.updated_at
}

/// Check if a profile exists for an address
public fun profile_exists(registry: &ProfileRegistry, addr: address): bool {
    registry.profiles.contains(addr)
}

/// Check if a username is taken
public fun username_exists(registry: &ProfileRegistry, username: String): bool {
    registry.usernames.contains(username)
}

#[test_only]
/// Initialize for testing
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}
