// Manually defined types for client-side use, mirroring the data structure from the server load function.

export interface WorkshopSettings {
    id: number;
    allow_user_register: boolean;
    enable_showing_follower: boolean;
    enable_user_follow_func: boolean;
    enable_deck_favorite_func: boolean;
    enable_online_study_func: boolean;
}

export interface DeckData {
    id: number;
    deck_name: string;
    deck_description: string;
    deck_tags: string | null; // Assuming deck_tags can be null based on schema
    deck_size: number;
    deck_card_count: number | null; // Assuming deck_card_count can be null
    deck_price: number | null; // Assuming deck_price can be null
    deck_purchase_link: string;
    deck_liked_by_people: number | null; // Assuming deck_liked_by_people can be null
    deck_cover_image_url: string | null; // Assuming deck_cover_image_url can be null
    support_platform: string; // Assuming this is stored as a string
    last_updated_date: string; // Assuming date is stored as text
    deck_author_name: string;
    deck_author_image: string | null; // Assuming user image can be null
}
