#!/usr/bin/env bash
#
# Build the man page demo. Applies the files in proposal/ to a curl-www
# checkout, builds docs/manpage.html there, and extracts it with its assets
# into this repository for static hosting. The curl-www checkout is restored
# afterwards.
#
# Needs the curl-www build tools (make, perl, fcpp, roffit, pandoc) and a
# curl-www checkout with cvssource pointing at a configured curl source tree.

set -euo pipefail

usage() {
    cat <<'EOF'
Usage: scripts/build-demo.sh [--www DIR] [--roffit DIR] [--keep] [--no-curl-docs] [--full]
  --www DIR        curl-www checkout (default ../curl-www)
  --roffit DIR     directory with the roffit to use (default ../roffit if it exists)
  --keep           leave the proposal applied in curl-www after the build
  --no-curl-docs   skip regenerating the curl docs in the curl source
  --full           run the whole site build instead of only docs/manpage.html
EOF
}

here=$(cd "$(dirname "$0")/.." && pwd)
www="$here/../curl-www"
roffitdir=""
keep=0
curldocs=1
full=0

while [ $# -gt 0 ]; do
    case "$1" in
        --www) www=$2; shift 2 ;;
        --roffit) roffitdir=$2; shift 2 ;;
        --keep) keep=1; shift ;;
        --no-curl-docs) curldocs=0; shift ;;
        --full) full=1; shift ;;
        -h|--help) usage; exit 0 ;;
        *) usage >&2; exit 1 ;;
    esac
done

www=$(cd "$www" && pwd)
if [ -z "$roffitdir" ] && [ -x "$here/../roffit/roffit" ]; then
    roffitdir="$here/../roffit"
fi
if [ -n "$roffitdir" ]; then
    PATH="$(cd "$roffitdir" && pwd):$PATH"
fi
cvs=$(readlink -f "$www/cvssource")

for tool in make perl fcpp roffit pandoc git; do
    command -v "$tool" >/dev/null || { echo "missing tool: $tool" >&2; exit 1; }
done
echo "using $(roffit --version | head -1)"

cd "$here"
paths=()
while IFS= read -r p; do
    paths+=("$p")
done < <(cd proposal && find . -type f ! -name BASE ! -name curl-www.patch | sed 's#^\./##' | sort)
[ ${#paths[@]} -gt 0 ] || { echo "proposal/ has no files" >&2; exit 1; }

if ! git -C "$www" diff --quiet -- "${paths[@]}"; then
    echo "$www has local changes in: ${paths[*]}" >&2
    exit 1
fi

# Carry upstream changes made since proposal/BASE into the proposal files.
base=$(cat proposal/BASE)
target=$(git -C "$www" rev-parse HEAD)
if [ "$target" != "$(git -C "$www" rev-parse -q --verify upstream/master || true)" ]; then
    echo "warning: $www is not at upstream/master" >&2
fi
if [ "$base" != "$target" ]; then
    tmp=$(mktemp -d)
    for p in "${paths[@]}"; do
        if git -C "$www" cat-file -e "$base:$p" 2>/dev/null &&
           ! git -C "$www" diff --quiet "$base" "$target" -- "$p"; then
            git -C "$www" show "$base:$p" > "$tmp/base"
            git -C "$www" show "$target:$p" > "$tmp/target"
            if ! git merge-file "proposal/$p" "$tmp/base" "$tmp/target"; then
                echo "conflict while merging upstream changes into proposal/$p" >&2
                exit 2
            fi
            echo "merged upstream changes into proposal/$p"
        fi
    done
    rm -rf "$tmp"
    echo "$target" > proposal/BASE
fi

# Apply the proposal, and put curl-www back the way it was when done.
tracked=()
newfiles=()
for p in "${paths[@]}"; do
    if git -C "$www" ls-files --error-unmatch -- "$p" >/dev/null 2>&1; then
        tracked+=("$p")
    elif [ -e "$www/$p" ]; then
        echo "$www/$p exists but is not tracked, leaving it alone" >&2
        exit 1
    else
        newfiles+=("$p")
    fi
done
restore() {
    [ "$keep" = 1 ] && return
    if [ ${#tracked[@]} -gt 0 ] && ! git -C "$www" checkout -q -- "${tracked[@]}"; then
        echo "could not restore ${tracked[*]} in $www" >&2
    fi
    for p in ${newfiles[@]+"${newfiles[@]}"}; do
        rm -f "$www/$p"
    done
}
trap restore EXIT
for p in "${paths[@]}"; do
    mkdir -p "$(dirname "$www/$p")"
    cp "proposal/$p" "$www/$p"
done

if [ "$curldocs" = 1 ]; then
    if [ ! -f "$cvs/Makefile" ]; then
        (cd "$cvs" && autoreconf -fi && ./configure --without-ssl --without-libpsl)
    elif [ -n "$(find "$cvs/configure.ac" "$cvs/docs" -maxdepth 2 \
                 \( -name configure.ac -o -name Makefile.am -o -name Makefile.inc \) \
                 -newer "$cvs/config.status")" ]; then
        # automake copies Makefile.inc into Makefile.in, so a newer option
        # list needs a new Makefile.in. Keep the earlier configure options.
        (cd "$cvs" && autoreconf -fi && ./config.status --recheck && ./config.status)
    fi
    # curl.1 does not depend on the list of option files, only on the files,
    # so an option added since the last build would be left out
    rm -f "$cvs/docs/cmdline-opts/curl.1"
    make -s -C "$cvs/docs"
fi

# Both are generated and never rebuilt once they exist, so start fresh.
rm -f "$www/docs/manoptionsdump.gen" "$www/docs/mandump.gen"
if [ "$full" = 1 ]; then
    make -C "$www"
else
    make -C "$www/docs" manpage.html
fi

{
    git -C "$www" diff --no-color -- "${paths[@]}"
    for p in ${newfiles[@]+"${newfiles[@]}"}; do
        (cd "$www" && git diff --no-color --no-index -- /dev/null "$p") || true
    done
} > proposal/curl-www.patch

perl scripts/extract-demo.pl "$www" docs/manpage.html "$here"

options=$(grep -c '<a href="#' "$www/docs/manoptionsdump.gen")
expected=$(grep -l '^Long: ' "$cvs"/docs/cmdline-opts/*.md | wc -l)
if [ "$options" != "$expected" ]; then
    echo "the menu has $options options, but curl has $expected" >&2
    exit 1
fi

# The Content-Security-Policy curl.se sends: the site default, and the one
# for the man page, which falls back to the default.
csp_default=$(sed -n 's/^Header set Content-Security-Policy: "\(.*\)"$/\1/p' "$www/.htaccess" | head -1)
csp_page=$(perl -0ne 'print $1 if m{<FilesMatch "\^manpage\\\.html\$">.*?Header set Content-Security-Policy: "([^"]*)"}s' \
           "$www/docs/.htaccess")
csp_page=${csp_page:-$csp_default}

version=$(sed -n 's/^#define LIBCURL_VERSION "\(.*\)"/\1/p' "$cvs/include/curl/curlver.h")
release=$(git -C "$cvs" describe --tags --abbrev=0 | sed 's/^curl-//; s/_/./g')
cat > demo-build.json <<EOF
{
  "builtAt": "$(date -u +%Y-%m-%d)",
  "curl": { "version": "$version", "commit": "$(git -C "$cvs" rev-parse --short=10 HEAD)", "latestRelease": "$release" },
  "curlWww": { "base": "$(cut -c1-8 proposal/BASE)" },
  "roffit": "$(roffit --version | sed -n 's/^roffit \([0-9.]*\).*/\1/p')",
  "options": $options,
  "csp": {
    "page": "$csp_page",
    "default": "$csp_default"
  }
}
EOF

echo "built the demo from curl $version and curl-www $(cut -c1-8 proposal/BASE): $options options"
