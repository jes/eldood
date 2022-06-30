package NotDoodle;

use strict;
use warnings;

use DBI;

my $TOKEN_LENGTH = 5; # bytes

my $DBH;
sub dbh {
    if (!$DBH || !$DBH->ping) {
        $DBH = DBI->connect("dbi:SQLite:dbname=notdoodle.db", "", "", {
            RaiseError => 1,
            AutoCommit => 1,
        });
    }
    return $DBH
}

sub random_token {
    open(my $fh, '<', '/dev/urandom')
        or die "can't read /dev/urandom: $!\n";
    read($fh, my $buf, $TOKEN_LENGTH);
    close $fh;
    return unpack("h*", $buf);
}

sub get {
    my ($pkg, $token) = @_;
    my $row = dbh->selectrow_hashref(qq{
        SELECT * FROM polls
        WHERE token = ?
    }, {}, $token);
    return undef if !$row;
    return bless $row, $pkg;
}

# name: "My NotDoodle poll"
# descr: "This is an example poll"
# dates: "20220630,20220701,20220704,20220819"
sub new {
    my ($pkg, %args) = @_;
    my $token = random_token();
    dbh->do(qq{
        INSERT INTO polls
        (token, name, descr, dates)
        VALUES (?, ?, ?, ?)
    }, {}, $token, $args{name}, $args{descr}, $args{dates});
    return $pkg->get($token);
}

# name: "jes"
# dates: "20220701,20220819"
sub respond {
    my ($self, %args) = @_;
    my $respo = random_token();
    dbh->do(qq{
        INSERT INTO responses
        (token, respo, name, dates)
        VALUES (?, ?, ?, ?)
    }, {}, $self->{token}, $respo, $args{name}, $args{dates});
}

# "b653ead819"
sub scrub {
    my ($self, $respo) = @_;
    dbh->do(qq{
        DELETE FROM responses
        WHERE token = ? AND respo = ?
    }, {}, $self->{token}, $respo);
}

# respo: "b653ead819"
# name: "jes"
# dates: "20220701,20220819"
sub update {
    my ($self, %args) = @_;
    dbh->do(qq{
        UPDATE responses
        SET name = ?, dates = ?
        WHERE token = ? AND respo = ?
    }, {}, $self->{token}, $args{respo});
}

sub responses {
    my ($self) = @_;
    my @rows = @{ dbh->selectall_arrayref(qq{
        SELECT * FROM responses
        WHERE token = ?
    }, {Slice => {}}, $self->{token}) };
    return @rows;
}

1;
