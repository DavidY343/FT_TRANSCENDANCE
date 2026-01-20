
-- TABLE: users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(150) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
    password VARCHAR(128) NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: friendships
CREATE TABLE friendships (
    id UUID PRIMARY KEY,
    requester_id UUID NOT NULL,
    addressee_id UUID NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_requester FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_addressee FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_friendship UNIQUE (requester_id, addressee_id)
);

-- TABLE: games
CREATE TABLE games (
    id UUID PRIMARY KEY,
    white_id UUID NOT NULL,
    black_id UUID,
    vs_ai BOOLEAN DEFAULT FALSE,
    fen VARCHAR(100) DEFAULT '',
    status VARCHAR(10) NOT NULL DEFAULT 'WAITING',
    turn CHAR(1) DEFAULT 'w',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_white FOREIGN KEY (white_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_black FOREIGN KEY (black_id) REFERENCES users(id) ON DELETE SET NULL
);

-- TABLE: game_results
CREATE TABLE game_results (
    id UUID PRIMARY KEY,
    game_id UUID NOT NULL UNIQUE,
    winner_id UUID,
    loser_id UUID,
    result VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    CONSTRAINT fk_winner FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_loser FOREIGN KEY (loser_id) REFERENCES users(id) ON DELETE SET NULL
);

-- TABLE: user_statistics
CREATE TABLE user_statistics (
    user_id UUID PRIMARY KEY,
    total_games INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    elo_rating INTEGER DEFAULT 1000,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_stat FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
