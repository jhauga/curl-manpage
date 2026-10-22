#!/usr/bin/env perl
#
# Rewrite a page built by curl-www so it can be hosted outside curl.se.
#
# usage: extract-demo.pl <curl-www dir> <page> <output dir>
#   page: the built page, relative to the curl-www root (docs/manpage.html)
#
# Writes <output dir>/index.html and fills <output dir>/assets/ with the
# stylesheets, icons, and images the page loads from the site, copied from
# the curl-www checkout. Links to other pages point at https://curl.se.
# Fragment links stay as they are.

use strict;
use warnings;
use File::Basename qw(dirname);
use File::Copy qw(copy);
use File::Path qw(make_path remove_tree);

my ($www, $page, $outdir) = @ARGV;
die "usage: extract-demo.pl <curl-www dir> <page> <output dir>\n"
    unless defined $outdir;

my $site = "https://curl.se";
my $pagedir = dirname($page);
my $assets = "assets";

open(my $in, "<", "$www/$page") or die "$www/$page: $!\n";
my $html = do { local $/; <$in> };
close($in);

remove_tree("$outdir/$assets");
my %copied;

# Return the site path of a URL that points at curl.se, the site root, or a
# file next to the page, or undef for anything else.
sub sitepath {
    my ($url) = @_;
    return $1 if $url =~ m{^(?:https?://curl\.se)?/(?!/)([^?#]*)};
    return undef if $url =~ m{^(?:[a-z][a-z0-9+.-]*:|#|//)}i;
    my $path = "$pagedir/$url";
    $path =~ s/[?#].*//;
    1 while $path =~ s{[^/]+/\.\./}{};
    $path =~ s{\./}{}g;
    return $path;
}

# Copy a site file into the assets folder and return its new URL.
sub asset {
    my ($path) = @_;
    my $from = "$www/$path";
    die "the page uses /$path, which is not in $www\n" unless -f $from;
    if(!$copied{$path}++) {
        make_path(dirname("$outdir/$assets/$path"));
        copy($from, "$outdir/$assets/$path") or die "copy $from: $!\n";
    }
    return "$assets/$path";
}

# Make a page link absolute, resolved against the page's location on curl.se.
sub resolve {
    my ($url) = @_;
    return $url if $url =~ m{^(?:[a-z][a-z0-9+.-]*:|#|//)}i;
    my $abs = ($url =~ m{^/}) ? "$site$url" : "$site/$pagedir/$url";
    my ($host, $path, $rest) = $abs =~ m{^(https://[^/]+)(/[^?#]*)(.*)$}s;
    my @seg;
    for my $s (split(m{/}, $path, -1)) {
        if($s eq "..") {
            pop @seg if @seg > 1;
        }
        elsif($s ne ".") {
            push @seg, $s;
        }
    }
    return $host . join("/", @seg) . $rest;
}

sub subresource {
    my ($url) = @_;
    my $path = sitepath($url);
    return defined $path ? asset($path) : $url;
}

# Stylesheets and icons.
$html =~ s{(<link\b[^>]*\brel="[^"]*(?:stylesheet|icon)[^"]*"[^>]*\bhref=")([^"]*)(")}
          {$1 . subresource($2) . $3}gie;
$html =~ s{(<link\b[^>]*\bhref=")([^"]*)("[^>]*\brel="[^"]*(?:stylesheet|icon)[^"]*")}
          {$1 . subresource($2) . $3}gie;
# Images and scripts.
$html =~ s{(\bsrc=")([^"]*)(")}{$1 . subresource($2) . $3}ge;
# CSS url() with a quoted value. The man page text has url(3), which has no quotes.
$html =~ s{(url\((["']))([^"']*)(\2\))}{$1 . subresource($3) . $4}ge;
# Links to other pages.
$html =~ s{(<a\b[^>]*\bhref=")([^"]*)(")}{$1 . resolve($2) . $3}ge;

# Nothing may still load from the site root or from curl.se.
my @left;
push @left, $1 while $html =~ m{(\bsrc="(?:https?://curl\.se)?/[^"]*")}g;
push @left, $1 while $html =~ m{(url\(["'](?:https?://curl\.se)?/[^"']*["']\))}g;
for my $link ($html =~ m{(<link\b[^>]*>)}g) {
    push @left, $link
        if $link =~ /rel="[^"]*(?:stylesheet|icon)/i &&
           $link =~ m{href="(?:https?://curl\.se)?/};
}
die "still loads from curl.se or the site root:\n  " . join("\n  ", @left) . "\n"
    if @left;

open(my $out, ">", "$outdir/index.html") or die "$outdir/index.html: $!\n";
print $out $html;
close($out);

printf "extracted %s: %d assets (%s)\n", $page, scalar(keys %copied),
    join(", ", sort keys %copied);
