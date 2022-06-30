CREATE TABLE polls (
    token TEXT PRIMARY KEY,
    name TEXT,
    descr TEXT,
    dates TEXT
);

CREATE TABLE responses (
    respo TEXT PRIMARY KEY,
    token TEXT,
    name TEXT,
    dates TEXT
);
