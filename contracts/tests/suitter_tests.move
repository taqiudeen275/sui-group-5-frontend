#[test_only]
module suitter::suitter_tests;

use suitter::suitter::{Self, SuiStore, Suit};
use suitter::profile::{Self, ProfileRegistry, Profile};
use suitter::comment::Comment;
use suitter::like::Like;
use std::string::{Self, String};
use sui::test_scenario::{Self as ts};

// Test addresses
const ADMIN: address = @0xAD;
const USER1: address = @0x1;
const USER2: address = @0x2;

// Helper function to create a test string
fun create_string(bytes: vector<u8>): String {
    string::utf8(bytes)
}

// ==================== SUITTER MODULE TESTS ====================

#[test]
fun test_create_and_keep_suit() {
    let mut scenario = ts::begin(USER1);
    
    // Create a suit
    {
        let body = create_string(b"Hello Suitter!");
        suitter::create_and_keep_suit(body, scenario.ctx());
    };
    
    // Verify suit was created and transferred to USER1
    scenario.next_tx(USER1);
    {
        let suit = scenario.take_from_sender<Suit>();
        scenario.return_to_sender(suit);
    };
    
    scenario.end();
}

#[test]
fun test_create_and_keep_comment() {
    let mut scenario = ts::begin(USER1);
    
    // First create a suit to get a SuiStore
    {
        let body = create_string(b"Original suit");
        suitter::create_and_keep_suit(body, scenario.ctx());
    };
    
    // Get the shared SuiStore
    scenario.next_tx(USER1);
    {
        let mut suit_store = scenario.take_shared<SuiStore>();
        let comment_text = create_string(b"Great suit!");
        
        suitter::create_and_keep_comment(comment_text, &mut suit_store, scenario.ctx());
        
        ts::return_shared(suit_store);
    };
    
    // Verify comment was created
    scenario.next_tx(USER1);
    {
        let comment = scenario.take_from_sender<Comment>();
        scenario.return_to_sender(comment);
    };
    
    scenario.end();
}

#[test]
fun test_create_and_keep_like() {
    let mut scenario = ts::begin(USER1);
    
    // Create a suit first
    {
        let body = create_string(b"Likeable suit");
        suitter::create_and_keep_suit(body, scenario.ctx());
    };
    
    // Like the suit
    scenario.next_tx(USER1);
    {
        let mut suit_store = scenario.take_shared<SuiStore>();
        
        suitter::create_and_keep_like(&mut suit_store, scenario.ctx());
        
        ts::return_shared(suit_store);
    };
    
    // Verify like was created
    scenario.next_tx(USER1);
    {
        let like = scenario.take_from_sender<Like>();
        scenario.return_to_sender(like);
    };
    
    scenario.end();
}

#[test]
#[expected_failure(abort_code = 1)]
fun test_create_like_twice_fails() {
    let mut scenario = ts::begin(USER1);
    
    // Create a suit
    {
        let body = create_string(b"Suit to like");
        suitter::create_and_keep_suit(body, scenario.ctx());
    };
    
    // Like the suit first time
    scenario.next_tx(USER1);
    {
        let mut suit_store = scenario.take_shared<SuiStore>();
        suitter::create_and_keep_like(&mut suit_store, scenario.ctx());
        ts::return_shared(suit_store);
    };
    
    // Try to like again - should fail
    scenario.next_tx(USER1);
    {
        let mut suit_store = scenario.take_shared<SuiStore>();
        suitter::create_and_keep_like(&mut suit_store, scenario.ctx());
        ts::return_shared(suit_store);
    };
    
    scenario.end();
}

#[test]
fun test_unlike_suit() {
    let mut scenario = ts::begin(USER1);
    
    // Create a suit
    {
        let body = create_string(b"Suit to unlike");
        suitter::create_and_keep_suit(body, scenario.ctx());
    };
    
    // Like the suit
    scenario.next_tx(USER1);
    {
        let mut suit_store = scenario.take_shared<SuiStore>();
        suitter::create_and_keep_like(&mut suit_store, scenario.ctx());
        ts::return_shared(suit_store);
    };
    
    // Unlike the suit
    scenario.next_tx(USER1);
    {
        let mut suit_store = scenario.take_shared<SuiStore>();
        suitter::unlike_suit(&mut suit_store, scenario.ctx());
        ts::return_shared(suit_store);
    };
    
    scenario.end();
}

#[test]
#[expected_failure(abort_code = 2)]
fun test_unlike_without_like_fails() {
    let mut scenario = ts::begin(USER1);
    
    // Create a suit
    {
        let body = create_string(b"Suit without like");
        suitter::create_and_keep_suit(body, scenario.ctx());
    };
    
    // Try to unlike without liking first - should fail
    scenario.next_tx(USER1);
    {
        let mut suit_store = scenario.take_shared<SuiStore>();
        suitter::unlike_suit(&mut suit_store, scenario.ctx());
        ts::return_shared(suit_store);
    };
    
    scenario.end();
}

#[test]
fun test_repost_and_keep_suit() {
    let mut scenario = ts::begin(USER1);
    
    // Create original suit
    {
        let body = create_string(b"Original suit to repost");
        suitter::create_and_keep_suit(body, scenario.ctx());
    };
    
    // Repost the suit
    scenario.next_tx(USER2);
    {
        let original_suit = scenario.take_from_address<Suit>(USER1);
        let mut original_suit_store = scenario.take_shared<SuiStore>();
        
        suitter::repost_and_keep_suit(&original_suit, &mut original_suit_store, scenario.ctx());
        
        ts::return_to_address(USER1, original_suit);
        ts::return_shared(original_suit_store);
    };
    
    // Verify reposted suit was created
    scenario.next_tx(USER2);
    {
        let reposted_suit = scenario.take_from_sender<Suit>();
        let reposted_store = scenario.take_from_sender<SuiStore>();
        
        scenario.return_to_sender(reposted_suit);
        scenario.return_to_sender(reposted_store);
    };
    
    scenario.end();
}

// ==================== PROFILE MODULE TESTS ====================

#[test]
fun test_create_and_keep_profile() {
    let mut scenario = ts::begin(ADMIN);
    
    // Initialize profile registry
    profile::init_for_testing(scenario.ctx());
    
    // Create a profile
    scenario.next_tx(USER1);
    {
        let mut registry = scenario.take_shared<ProfileRegistry>();
        let username = create_string(b"alice");
        let bio = create_string(b"Hello, I'm Alice!");
        let image_url = create_string(b"https://example.com/alice.jpg");
        
        profile::create_and_keep_profile(&mut registry, username, bio, image_url, scenario.ctx());
        
        ts::return_shared(registry);
    };
    
    // Verify profile was created
    scenario.next_tx(USER1);
    {
        let user_profile = scenario.take_from_sender<Profile>();
        
        assert!(profile::get_username(&user_profile) == create_string(b"alice"), 0);
        assert!(profile::get_bio(&user_profile) == create_string(b"Hello, I'm Alice!"), 1);
        assert!(profile::get_owner(&user_profile) == USER1, 2);
        
        scenario.return_to_sender(user_profile);
    };
    
    scenario.end();
}

#[test]
#[expected_failure(abort_code = 1)]
fun test_create_profile_twice_fails() {
    let mut scenario = ts::begin(ADMIN);
    
    profile::init_for_testing(scenario.ctx());
    
    // Create first profile
    scenario.next_tx(USER1);
    {
        let mut registry = scenario.take_shared<ProfileRegistry>();
        let username = create_string(b"alice");
        let bio = create_string(b"Bio 1");
        let image_url = create_string(b"url1");
        
        profile::create_and_keep_profile(&mut registry, username, bio, image_url, scenario.ctx());
        ts::return_shared(registry);
    };
    
    // Try to create second profile - should fail
    scenario.next_tx(USER1);
    {
        let mut registry = scenario.take_shared<ProfileRegistry>();
        let username = create_string(b"alice2");
        let bio = create_string(b"Bio 2");
        let image_url = create_string(b"url2");
        
        profile::create_and_keep_profile(&mut registry, username, bio, image_url, scenario.ctx());
        ts::return_shared(registry);
    };
    
    scenario.end();
}

#[test]
#[expected_failure(abort_code = 2)]
fun test_create_profile_duplicate_username_fails() {
    let mut scenario = ts::begin(ADMIN);
    
    profile::init_for_testing(scenario.ctx());
    
    // USER1 creates profile with username "alice"
    scenario.next_tx(USER1);
    {
        let mut registry = scenario.take_shared<ProfileRegistry>();
        let username = create_string(b"alice");
        let bio = create_string(b"Bio 1");
        let image_url = create_string(b"url1");
        
        profile::create_and_keep_profile(&mut registry, username, bio, image_url, scenario.ctx());
        ts::return_shared(registry);
    };
    
    // USER2 tries to create profile with same username - should fail
    scenario.next_tx(USER2);
    {
        let mut registry = scenario.take_shared<ProfileRegistry>();
        let username = create_string(b"alice");
        let bio = create_string(b"Bio 2");
        let image_url = create_string(b"url2");
        
        profile::create_and_keep_profile(&mut registry, username, bio, image_url, scenario.ctx());
        ts::return_shared(registry);
    };
    
    scenario.end();
}

#[test]
fun test_update_profile_bio() {
    let mut scenario = ts::begin(ADMIN);
    
    profile::init_for_testing(scenario.ctx());
    
    // Create profile
    scenario.next_tx(USER1);
    {
        let mut registry = scenario.take_shared<ProfileRegistry>();
        let username = create_string(b"alice");
        let bio = create_string(b"Original bio");
        let image_url = create_string(b"url");
        
        profile::create_and_keep_profile(&mut registry, username, bio, image_url, scenario.ctx());
        ts::return_shared(registry);
    };
    
    // Update bio
    scenario.next_tx(USER1);
    {
        let mut user_profile = scenario.take_from_sender<Profile>();
        let new_bio = create_string(b"Updated bio");
        
        profile::update_profile_bio(&mut user_profile, new_bio, scenario.ctx());
        
        assert!(profile::get_bio(&user_profile) == create_string(b"Updated bio"), 0);
        
        scenario.return_to_sender(user_profile);
    };
    
    scenario.end();
}

#[test]
fun test_update_profile_image_url() {
    let mut scenario = ts::begin(ADMIN);
    
    profile::init_for_testing(scenario.ctx());
    
    // Create profile
    scenario.next_tx(USER1);
    {
        let mut registry = scenario.take_shared<ProfileRegistry>();
        let username = create_string(b"alice");
        let bio = create_string(b"Bio");
        let image_url = create_string(b"old_url");
        
        profile::create_and_keep_profile(&mut registry, username, bio, image_url, scenario.ctx());
        ts::return_shared(registry);
    };
    
    // Update image URL
    scenario.next_tx(USER1);
    {
        let mut user_profile = scenario.take_from_sender<Profile>();
        let new_url = create_string(b"new_url");
        
        profile::update_profile_image_url(&mut user_profile, new_url, scenario.ctx());
        
        assert!(profile::get_profile_image_url(&user_profile) == create_string(b"new_url"), 0);
        
        scenario.return_to_sender(user_profile);
    };
    
    scenario.end();
}

#[test]
fun test_update_profile_username() {
    let mut scenario = ts::begin(ADMIN);
    
    profile::init_for_testing(scenario.ctx());
    
    // Create profile
    scenario.next_tx(USER1);
    {
        let mut registry = scenario.take_shared<ProfileRegistry>();
        let username = create_string(b"alice");
        let bio = create_string(b"Bio");
        let image_url = create_string(b"url");
        
        profile::create_and_keep_profile(&mut registry, username, bio, image_url, scenario.ctx());
        ts::return_shared(registry);
    };
    
    // Update username
    scenario.next_tx(USER1);
    {
        let mut registry = scenario.take_shared<ProfileRegistry>();
        let mut user_profile = scenario.take_from_sender<Profile>();
        let new_username = create_string(b"alice_updated");
        
        profile::update_profile_username(&mut registry, &mut user_profile, new_username, scenario.ctx());
        
        assert!(profile::get_username(&user_profile) == create_string(b"alice_updated"), 0);
        
        scenario.return_to_sender(user_profile);
        ts::return_shared(registry);
    };
    
    scenario.end();
}

#[test]
#[expected_failure(abort_code = 2)]
fun test_update_username_to_existing_fails() {
    let mut scenario = ts::begin(ADMIN);
    
    profile::init_for_testing(scenario.ctx());
    
    // USER1 creates profile
    scenario.next_tx(USER1);
    {
        let mut registry = scenario.take_shared<ProfileRegistry>();
        profile::create_and_keep_profile(
            &mut registry, 
            create_string(b"alice"), 
            create_string(b"Bio1"), 
            create_string(b"url1"), 
            scenario.ctx()
        );
        ts::return_shared(registry);
    };
    
    // USER2 creates profile
    scenario.next_tx(USER2);
    {
        let mut registry = scenario.take_shared<ProfileRegistry>();
        profile::create_and_keep_profile(
            &mut registry, 
            create_string(b"bob"), 
            create_string(b"Bio2"), 
            create_string(b"url2"), 
            scenario.ctx()
        );
        ts::return_shared(registry);
    };
    
    // USER2 tries to change username to "alice" - should fail
    scenario.next_tx(USER2);
    {
        let mut registry = scenario.take_shared<ProfileRegistry>();
        let mut user_profile = scenario.take_from_sender<Profile>();
        
        profile::update_profile_username(&mut registry, &mut user_profile, create_string(b"alice"), scenario.ctx());
        
        scenario.return_to_sender(user_profile);
        ts::return_shared(registry);
    };
    
    scenario.end();
}

#[test]
#[expected_failure(abort_code = 3)]
fun test_update_bio_wrong_owner_fails() {
    let mut scenario = ts::begin(ADMIN);
    
    profile::init_for_testing(scenario.ctx());
    
    // USER1 creates profile
    scenario.next_tx(USER1);
    {
        let mut registry = scenario.take_shared<ProfileRegistry>();
        profile::create_and_keep_profile(
            &mut registry, 
            create_string(b"alice"), 
            create_string(b"Bio"), 
            create_string(b"url"), 
            scenario.ctx()
        );
        ts::return_shared(registry);
    };
    
    // USER2 tries to update USER1's bio - should fail
    scenario.next_tx(USER2);
    {
        let mut user_profile = scenario.take_from_address<Profile>(USER1);
        profile::update_profile_bio(&mut user_profile, create_string(b"Hacked bio"), scenario.ctx());
        ts::return_to_address(USER1, user_profile);
    };
    
    scenario.end();
}
