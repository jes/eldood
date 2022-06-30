package Eldood::Config;

use strict;
use warnings;

use YAML;

my $CONFIG = YAML::LoadFile('eldood.yaml');

my @REQUIRED = qw(root database app_secret port);
my @missing = map { (exists $CONFIG->{$_} ? () : ($_)) } @REQUIRED;
die "Eldood::Config: eldood.yaml: missing required option(s): " . join(', ', sort @missing) if @missing;

my @unrecognised;
for my $key (keys %$CONFIG) {
    push @unrecognised, $key if !grep { $_ eq $key } @REQUIRED;
}
die "Eldood::Config: config.yaml: contains unrecognised option(s): " . join(', ', sort @unrecognised) if @unrecognised;

sub get {
    my ($pkg, $key) = @_;
    return $CONFIG->{$key};
}

1;
