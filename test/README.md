# Manual Test Log Process

For each browser tested the steps were:
1. Expand nested items in console
2. Save .log to test-results.log
3. Run `` clean-test-log.sh ``
4. Move .log file to corresponding directory:
   - platform-name
     - browser-name-test-results.log
