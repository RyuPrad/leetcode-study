// Reviewed, problem-specific questions. The first number is the revealed trace index.
import fs from 'node:fs';
export const authored = new Map();
const lesson = (number, intro, mistake, questions, concepts = []) => authored.set(number, { intro, mistake, questions, concepts });
lesson(1, 'Find two different positions whose numbers add to 9.', 'Storing a number before checking its complement can accidentally reuse the same position.', [
 [4, 'With current number 2, which partner do we look for in the map?', '7', '2', '9', 'Subtract the current number from the target: 9 - 2.'],
 [6, 'No partner was found. What should the map remember now?', 'Value 2 at index 0', 'Value 7 at index 0', 'Value 2 at index 1', 'The map stores numbers already visited, paired with their original positions.'],
 [11, 'Current number 7 needs 2. Which pair of positions can we return?', '[0, 1]', '[2, 7]', '[1, 1]', 'The previous 2 is at position 0 and the current 7 is at position 1.']
], ['maps','indexing','comparison']);
lesson(2, 'Add two numbers whose linked lists store the ones digit first.', 'A carry belongs in the next digit column, not in a separate two-digit node.', [
 [3, 'The first digits are 2 and 5 with no carry. What is their column sum?', '7', '25', '3', 'A digit column adds both input digits and the incoming carry.'],
 [11, 'The next column sums to 10. What carry moves to the next column?', '1', '0', '10', 'Integer division by ten extracts the carry; the remainder becomes this output digit.'],
 [25, 'Which reverse-order digit list represents the completed sum?', '[7, 0, 8]', '[8, 0, 7]', '[7, 10, 7]', '342 + 465 = 807, so the result stores ones, tens, then hundreds.']
], ['references','assignment','loops']);
lesson(3, 'Find the longest contiguous stretch of characters with no repeated character.', 'Removing only the newest duplicate leaves the old duplicate inside the window.', [
 [3, 'The window is empty and the next character is a. What action is allowed?', 'Add a to the window set', 'Move the left edge past a', 'Return zero immediately', 'The set must contain each character in the current window exactly once.'],
 [19, 'A second a arrives after abc. Which old character must leave the window?', 'The first a', 'The c', 'The new a permanently', 'Move the left edge until the previous occurrence of the incoming character is removed.'],
 [56, 'After the whole string is scanned, what longest length is returned?', '3', '8', '1', 'Windows such as abc and bca have three unique characters; no longer valid window survives.']
], ['sets','indexing','loops']);
lesson(4, 'Find the middle value of two sorted arrays without merging every element.', 'A balanced number of elements is not enough: both left edges must be no larger than the opposite right edge.', [
 [3, 'With half = 2 and the small-array cut i = 0, where must the other cut j be?', '2', '0', '1', 'The two left partitions must contain half elements, so j = half - i.'],
 [5, 'The left edge 3 exceeds the opposite right edge 2. How should the small-array cut move?', 'Move right to include 2 on the left', 'Move left beyond the array', 'Accept this partition', 'Too few elements were taken from the smaller array, leaving a smaller value on the right.'],
 [10, 'The valid partition has left edges 2 and 1 and odd total length. What is the median?', '2', '1.5', '3', 'With an odd count, the extra left-partition element is its largest value.']
], ['indexing','comparison','loops']);
lesson(5, 'Grow matching characters outward from each possible palindrome center.', 'Checking only centers on characters misses even-length palindromes centered between characters.', [
 [5, 'The even center compares b with a. Should this expansion continue?', 'No, the characters differ', 'Yes, because they are adjacent', 'Yes, until the string ends', 'A palindrome can expand only while its mirrored boundary characters match.'],
 [8, 'Expanding around a reaches matching b characters. Which best span is saved?', 'bab, length 3', 'ba, length 2', 'babad, length 5', 'The inclusive boundaries 0 and 2 contain three characters.'],
 [28, 'Both bab and aba have length 3. Which substring does this implementation return?', 'bab', 'aba', 'babad', 'The best span changes only for a strictly longer palindrome, so the first length-three span remains.']
], ['indexing','comparison','loops']);
lesson(7, 'Reverse the decimal digits of an integer while respecting the signed 32-bit range.', 'Appending a digit requires multiplying the partial result by ten first.', [
 [4, 'Which digit does 123 % 10 peel off first?', '3', '1', '12', 'Remainder after division by ten is the rightmost decimal digit.'],
 [9, 'The partial reverse is 3 and the next digit is 2. What is the new reverse?', '32', '5', '23', 'Shift the partial result one decimal place and append: 3 * 10 + 2.'],
 [18, 'All digits were reversed and the value fits the allowed range. What is returned?', '321', '0', '123', 'The positive sign is restored and the in-range reversed value is retained.']
], ['assignment','loops','comparison']);
lesson(10, 'Decide whether the entire string aa matches the pattern a*.', 'The star repeats its preceding token; it is not an independent wildcard for any character.', [
 [3, 'Can a* match an empty prefix?', 'Yes, by using zero a characters', 'No, a is always required once', 'Only if the input contains a literal star', 'A token followed by star may contribute zero occurrences.'],
 [7, 'Can a* consume the second a after already matching the first?', 'Yes, reuse the star state from the previous string row', 'No, star allows at most one a', 'Only by deleting the pattern', 'The one-more branch keeps the pattern column and consumes one input character.'],
 [8, 'What does the final table cell say about aa and a*?', 'The whole string matches', 'Only the first character matches', 'No characters match', 'The bottom-right cell represents both complete prefixes.']
], ['indexing','comparison','loops']);
lesson(11, 'Choose two vertical walls that hold the largest rectangular amount of water.', 'Moving the taller wall cannot improve the limiting height while width shrinks.', [
 [4, 'The left wall is shorter in the first pair. Which pointer should move?', 'The left pointer', 'The right pointer', 'Both pointers to the center', 'Only replacing the shorter wall can raise the current height limit.'],
 [8, 'After finding a stronger pair, the right wall is shorter or tied. Which boundary moves now?', 'The right boundary moves left', 'The left boundary moves left', 'Neither boundary can move', 'The same shorter-wall rule applies independently at every pair.'],
 [35, 'What maximum area survives after every candidate pair is considered?', '49', '8', '64', 'The best pair has width seven and limiting height seven.']
], ['indexing','comparison','loops']);
lesson(13, 'Convert Roman symbols to a number, subtracting only before a larger symbol.', 'Equal adjacent Roman symbols are added; subtraction requires a strictly larger following symbol.', [
 [2, 'The first I is followed by another I. Should its value be added or subtracted?', 'Added', 'Subtracted', 'Ignored', 'The next value is equal, not larger.'],
 [6, 'After reading the second I in III, what total is stored?', '2', '0', '11', 'Each I contributes one because no subtractive pair occurs.'],
 [10, 'What integer does III produce?', '3', '2', '111', 'All three one-valued symbols are added.']
], ['comparison','assignment','loops']);
lesson(14, 'Compare strings one column at a time to find their shared beginning.', 'A prefix must be shared by every string, not merely the first pair.', [
 [10, 'Every string matches the first column. Which prefix is now confirmed?', 'f', 'fl', 'flower', 'Only columns that passed every row comparison belong to the confirmed prefix.'],
 [20, 'The second column also matches everywhere. What prefix is confirmed now?', 'fl', 'flo', 'l', 'The shared prefix grows by one fully checked column.'],
 [28, 'A mismatch occurs at index 2. Which slice should be returned?', 'The characters before index 2: fl', 'The first three characters: flo', 'The mismatching character alone', 'slice(0, i) excludes the first mismatching column.']
], ['indexing','loops','comparison']);
lesson(15, 'Find every distinct triple whose sum is zero using sorting and two moving pointers.', 'Skipping duplicate values is necessary to avoid repeating the same value triple.', [
 [6, 'The first trial sum is below zero. Which pointer movement can increase it?', 'Move left to the right', 'Move right to the left', 'Move both pointers left', 'In sorted order, advancing the left pointer replaces its value with an equal or larger one.'],
 [22, 'A trial sum is exactly zero. What should happen to that triple?', 'Save it as a solution', 'Discard it because zero is too small', 'Return only its middle index', 'All three selected values satisfy the target together.'],
 [43, 'What kind of result is returned after the scan?', 'All unique zero-sum value triples', 'Only the first zero-sum triple', 'Every ordering of each triple', 'Sorted scanning and duplicate skipping collect each value combination once.']
], ['indexing','comparison','loops']);
lesson(17, 'Choose one letter for each phone-keypad digit to generate every possible string.', 'Undo each chosen letter after recursion so sibling branches do not inherit it.', [
 [7, 'The first digit is 2 and its first candidate is a. What enters the path?', 'a', '2', 'def', 'The path contains letters chosen from each digit mapping.'],
 [16, 'After recording ad, which letter is removed to try the next branch?', 'd', 'a', 'Both letters at once', 'Undo the most recent choice while keeping the earlier digit choice a.'],
 [88, 'Digits 2 and 3 each offer three letters. How many complete strings are returned?', '9', '6', '3', 'Each of three first letters pairs with each of three second letters.']
], ['recursion','stack','maps']);
lesson(18, 'Find unique groups of four numbers adding to the target by fixing two positions and scanning the other two.', 'Distinct indices can hold equal values, but identical result quadruples should only be recorded once.', [
 [5, 'After fixing i and j, where does the movable left pointer begin?', 'Immediately after j', 'At i again', 'At the last array position', 'Starting at j + 1 prevents reusing either fixed position.'],
 [7, 'How many selected values contribute to each trial sum?', 'Four: i, j, left, and right', 'Two: only left and right', 'Every value in the array', 'The two fixed choices and the moving pair form one candidate quadruple.'],
 [60, 'What does the completed result contain?', 'Every unique quadruple summing to 0', 'All permutations of every quadruple', 'The indices of one pair', 'Duplicate skipping applies to fixed choices and pointer choices.']
], ['indexing','loops','comparison']);
lesson(19, 'Remove the second node from the end by keeping two pointers a fixed distance apart.', 'The slow pointer must stop before the removed node so its next link can bypass that node.', [
 [8, 'How large a gap is established before both pointers move together?', 'Two nodes', 'One node', 'The whole list length', 'Advancing fast n times creates the gap for the nth-from-end position.'],
 [16, 'When fast reaches the last node, which link removes the target?', 'slow.next = slow.next.next', 'slow = slow.next', 'fast.next = slow', 'Rewiring the predecessor bypasses the target without losing the remaining list.'],
 [18, 'Which list remains after removing the second node from the end?', '[1, 2, 3, 5]', '[1, 2, 3, 4]', '[2, 3, 4, 5]', 'Node 4 is second from the end of the original five-node list.']
], ['references','loops','assignment']);
lesson(20, 'Use a stack to check that each closing bracket matches the most recent unmatched opening bracket.', 'Matching a closing bracket against any earlier opener ignores nesting order.', [
 [2, 'The first character is an opening parenthesis. Where is it stored?', 'On top of the stack', 'In the final answer string', 'It is discarded immediately', 'An opener waits until its corresponding closer arrives.'],
 [4, 'A closing parenthesis arrives. What must the popped opener equal?', 'An opening parenthesis', 'A closing parenthesis', 'Any opening bracket shape', 'The closing-to-opening map requires the same bracket type.'],
 [6, 'The input ended and the stack is empty. Is the bracket sequence valid?', 'Yes, every opener was matched', 'No, empty means nothing matched', 'Only if there were no characters', 'An empty final stack means no unmatched opening brackets remain.']
], ['stack','maps','comparison']);
lesson(21, 'Build one sorted list by repeatedly attaching the smaller remaining head.', 'Moving a list pointer without first attaching its node can lose that node from the result.', [
 [2, 'Both current heads contain 1. Which list does the <= comparison choose?', 'List 1', 'List 2', 'Neither; equal values are skipped', 'The implementation resolves equal values through the less-than-or-equal branch.'],
 [8, 'The remaining heads are 2 and 1. Which node is attached next?', 'The 1 from list 2', 'The 2 from list 1', 'Both nodes are discarded', 'The smallest available head must be the next item of the sorted result.'],
 [28, 'Why does the return value start at dummy.next?', 'It skips the placeholder and returns the real merged head', 'It removes the smallest real value', 'It returns only the last node', 'The dummy is a construction aid and is not an input value.']
], ['references','comparison','assignment']);
lesson(22, 'Build balanced parentheses by allowing only choices that can still form a valid string.', 'A close parenthesis is allowed only when an unmatched open parenthesis already exists.', [
 [1, 'With an empty path and n = 1, what can be added first?', 'An opening parenthesis', 'A closing parenthesis', 'Both parentheses in reverse order', 'There is no opener available to match a closing parenthesis yet.'],
 [3, 'The path now has two characters, (). What happens next?', 'Copy it into the result', 'Add another opener', 'Discard it as too short', 'A complete valid path has exactly 2 * n characters.'],
 [6, 'How many valid strings are returned for one pair?', '1', '2', '0', 'Only () is balanced when exactly one opening and one closing parenthesis are used.']
], ['recursion','stack','comparison']);
lesson(23, 'Merge several sorted lists in rounds, pairing neighboring lists each round.', 'An unpaired last list still belongs in the next round; it must not be dropped.', [
 [4, 'The first two heads are both 1. Which comparison branch attaches a node?', 'The l1 <= l2 branch', 'The l1 > l2 branch', 'Neither, because equal nodes are duplicates', 'Merging preserves all nodes, including repeated equal values.'],
 [13, 'The third list has no partner in this round. What happens to it?', 'Attach its entire remaining chain', 'Delete it from consideration', 'Reverse it before the next round', 'Merging with null preserves the already sorted list.'],
 [29, 'Which chain is returned after only one list remains?', '[1, 1, 2, 3, 4, 4, 5, 6]', '[1, 2, 3, 4, 5, 6]', '[6, 5, 4, 4, 3, 2, 1, 1]', 'Pairwise merges keep ascending order and preserve every original node.']
], ['references','loops','comparison']);
lesson(25, 'Reverse linked-list nodes in complete groups of two while leaving an incomplete tail alone.', 'Save the next node before overwriting a link or the unreversed chain becomes unreachable.', [
 [4, 'After finding node 2 as the group end, which boundary is saved?', 'Node 3, the first node after the group', 'Node 1, the first node in the group', 'Null, regardless of the remaining list', 'groupNext marks the first node that this reversal must not process.'],
 [10, 'After reversing the first two links, where does node 2 point?', 'To node 1', 'To node 3', 'To itself', 'Reversing a group flips the direction between its member nodes.'],
 [33, 'Only node 5 remains, fewer than k = 2 nodes. What happens to it?', 'It stays in its original position', 'It is deleted', 'It moves to the head', 'Only complete groups are reversed.']
], ['references','assignment','loops']);
lesson(26, 'Compact sorted values into a prefix containing one copy of each distinct number.', 'The returned length describes the useful prefix; values beyond that prefix are not part of the result.', [
 [3, 'The scanner sees a second 1. Should the unique-prefix boundary advance?', 'No, the value is already represented', 'Yes, every scanned value is unique', 'Move it backward to remove both 1s', 'Adjacent equal values in sorted order belong to the same distinct value.'],
 [7, 'The scanner reaches 2 after the unique 1. What should the useful prefix become?', '[1, 2]', '[2, 2]', '[1, 1, 2]', 'Advance the write boundary once and store the newly encountered value.'],
 [9, 'What k describes the completed unique prefix?', '2', '3', '1', 'The prefix contains exactly the distinct values 1 and 2.']
], ['indexing','assignment','loops']);
lesson(27, 'Keep every value except 3 by writing retained numbers into the front of the array.', 'The write pointer advances only when a value is kept, while the scan pointer always advances.', [
 [2, 'The first value equals the value to remove, 3. What should happen?', 'Skip it without advancing the write pointer', 'Copy it into the kept prefix', 'Stop scanning the array', 'A matching value contributes nothing to the result prefix.'],
 [7, 'The next value is 2 and is kept at index 0. What is the next write position?', '1', '0', '3', 'Keeping one element increments k by one.'],
 [18, 'What count is returned after both 3s are skipped?', '2', '4', '0', 'The useful prefix contains the two retained values 2 and 2.']
], ['indexing','assignment','comparison']);
lesson(33, 'Find a target in a rotated sorted array by identifying the sorted half at each step.', 'Ordinary binary-search direction is unsafe until the sorted half and its value range are identified.', [
 [5, 'The left half is sorted but does not contain the target. Which side remains useful?', 'The right side', 'The left side', 'Neither side', 'A sorted interval excludes any target outside its endpoint range.'],
 [12, 'Now the target fits the sorted left half. Which bound is updated?', 'right = mid - 1', 'left = mid + 1', 'right = mid + 1', 'The midpoint was already checked, so it can be excluded with the discarded right side.'],
 [16, 'The midpoint finally matches. Which index is returned?', '4', '0', '7', 'The result is the target position in the rotated array, not the target value.']
], ['indexing','comparison','loops']);
lesson(35, 'Use binary search to find a target or the position where it belongs in sorted order.', 'A found target returns its index, while a missing target returns the final left boundary.', [
 [3, 'The middle value is smaller than the target. Where can the answer be?', 'To the right of mid', 'Strictly left of mid', 'At any already discarded position', 'Sorted order rules out the midpoint and all smaller positions.'],
 [4, 'How should the lower search bound change?', 'left = mid + 1', 'left = mid', 'right = mid - 1', 'Excluding the checked midpoint guarantees the search interval shrinks.'],
 [8, 'The next middle value matches the target. What index is returned?', '2', '5', '3', 'The answer is its zero-based position, not the number stored there.']
], ['indexing','comparison','loops']);
lesson(36, 'Check that every filled Sudoku cell is unique in its row, column, and three-by-three box.', 'A valid partial board may contain empty cells; validation does not require solving them.', [
 [3, 'The first 5 appears in none of its three sets. Is it a conflict?', 'No, it is safe to record', 'Yes, every nonempty cell conflicts', 'Only the row matters', 'A conflict exists if any row, column, or box already contains that digit.'],
 [10, 'The next inspected cell contains a dot. What should the algorithm do?', 'Skip it without recording a digit', 'Record dot in all three sets', 'Return false because it is empty', 'Dots represent unfilled cells, not Sudoku digits.'],
 [223, 'Every filled cell passed its checks. What is returned?', 'true', 'false', 'A solved board', 'Validation reports consistency of the current filled cells.']
], ['sets','indexing','comparison']);
lesson(39, 'Build number combinations that sum to 7, allowing a candidate to be used more than once.', 'Recurse from the chosen index to allow reuse, while avoiding reordered copies of the same combination.', [
 [4, 'After choosing 2 once, where does the recursive candidate range start?', 'At the same index, so 2 can be reused', 'At the next index, forbidding another 2', 'At a random earlier position', 'Unlimited reuse keeps i as the next start index.'],
 [18, 'A branch has remaining sum -1. What happens next?', 'Prune the branch and return', 'Record it as a solution', 'Keep adding positive candidates', 'Positive additions cannot repair a sum that already exceeded the target.'],
 [167, 'How many distinct combinations sum to 7 in this example?', '2', '7', '1', 'The successful combinations are [2, 2, 3] and [7].']
], ['recursion','stack','comparison']);
lesson(40, 'Choose combinations summing to 8 while using each input position at most once.', 'Equal values at different positions may both be used, but identical sibling branches must be skipped.', [
 [5, 'After selecting the first 1, where does the recursive search start?', 'At the next index', 'At the same index again', 'Back at index zero', 'Advancing to i + 1 prevents reusing the selected input position.'],
 [9, 'Can the path include the second 1 from a different input position?', 'Yes, it is a distinct unused position', 'No, equal values are always forbidden', 'Only by replacing the first 1', 'The once-only rule applies to positions, not to all occurrences of a value.'],
 [132, 'How many unique combinations total 8 in this example?', '4', '8', '2', 'The results are [1,1,6], [1,2,5], [1,7], and [2,6].']
], ['recursion','indexing','comparison']);
lesson(41, 'Put each useful positive value into its matching home slot, then find the first missing home.', 'Zero and negative values have no home in the positive range 1 through n.', [
 [2, 'Value 1 already sits at index 0. Does it need swapping?', 'No, it is already home', 'Yes, put it at index 1', 'Yes, move it to the last slot', 'Value v belongs at zero-based index v - 1.'],
 [6, 'Value 0 is outside the useful range. What happens to it during placement?', 'Leave it and continue', 'Move it to index -1', 'Treat it as the missing positive', 'Only values from 1 through the array length have valid home slots.'],
 [11, 'The first incorrect home is index 2. Which positive number is missing?', '3', '2', '0', 'Home index 2 should hold value 2 + 1.']
], ['indexing','comparison','assignment']);
lesson(42, 'Measure water held above each bar using the tallest safe boundary seen from each side.', 'Water is a height difference above a bar, not the whole boundary height.', [
 [3, 'The endpoint heights are 0 on the left and 1 on the right. Which side can be processed?', 'The left side', 'Only the right side', 'Neither until all maxima are known', 'The shorter endpoint has a sufficient opposite boundary for its current calculation.'],
 [9, 'The right endpoint has height 1 and rightMax is 0. What does rightMax become?', '1', '0', '11', 'The maximum stores a height, using max(previous maximum, current height).'],
 [58, 'What total trapped water is accumulated for the complete height profile?', '6', '12', '3', 'Adding the bounded water above the individual bars gives six units.']
], ['comparison','assignment','loops']);
lesson(43, 'Multiply digit strings by placing each small product into its units and carry positions.', 'Leading padding zeroes in the temporary digit array are not part of the returned number string.', [
 [1, 'Which small product is formed from the input digits 2 and 3?', '6', '23', '5', 'String digits are converted to their numeric digit values before multiplication.'],
 [3, 'The column sum is 6. Which digit goes into the units position?', '6', '0', '60', 'Remainder modulo ten keeps the units digit in that position.'],
 [6, 'The temporary string is 06. What string is returned after removing padding?', '6', '06', '60', 'A leading zero is removed without moving or reversing the meaningful digit.']
], ['indexing','assignment','loops']);
lesson(45, 'Find the fewest jumps by expanding the farthest reach of each current jump window.', 'Do not count a new jump at every scanned cell; count one only when the current window ends.', [
 [2, 'Index 0 is the end of the current window. What happens after discovering reach 2?', 'Count one jump and extend the window to 2', 'Count two jumps immediately', 'Keep the window ending at 0', 'Crossing a window boundary commits one jump to the best reach found inside it.'],
 [4, 'Index 1 can reach index 4 but is still inside the window ending at 2. Count another jump now?', 'No, continue collecting reach within this window', 'Yes, every improved reach is a jump', 'Stop with zero jumps', 'The farthest reach and the number of committed jumps serve different purposes.'],
 [9, 'What minimum jump count reaches the final index?', '2', '4', '1', 'One jump reaches the first window and a second reaches the last position.']
], ['indexing','comparison','loops']);
lesson(46, 'Build every ordering of three distinct numbers by choosing one unused position at a time.', 'Clear a used flag when backtracking, otherwise later permutations lose that choice.', [
 [7, 'After choosing the first 1, how is its used flag changed?', 'Set used[0] to true', 'Set every flag to true', 'Leave used[0] false', 'A selected position cannot appear twice in the same permutation.'],
 [12, 'The next recursion level considers that same position again. What should it do?', 'Skip the already-used position', 'Append 1 again', 'Delete 1 from every future result', 'The used array describes the current path, not a global ban across all results.'],
 [177, 'How many full orderings are returned for three distinct numbers?', '6', '3', '9', 'There are three choices, then two, then one: 3 * 2 * 1.']
], ['recursion','indexing','assignment']);
lesson(47, 'Generate distinct orderings when the input contains repeated values.', 'The duplicate guard concerns an unused equal predecessor; equal values can coexist when chosen from distinct positions in one path.', [
 [7, 'At the root, can the first 1 be chosen?', 'Yes, it has no unused equal predecessor', 'No, all repeated values are forbidden', 'Only after choosing 2', 'Sorted equal values are represented by their first available sibling choice.'],
 [13, 'Inside the branch beginning with the first 1, may that same position be chosen again?', 'No, its used flag is already true', 'Yes, because another 1 exists', 'Only if the result is not saved', 'Each input position appears at most once in a permutation.'],
 [102, 'How many distinct orderings of [1, 1, 2] are returned?', '3', '6', '1', 'The different results are [1,1,2], [1,2,1], and [2,1,1].']
], ['recursion','indexing','comparison']);
lesson(48, 'Rotate a square image clockwise by transposing it and then reversing each row.', 'A transpose alone reflects across the diagonal; it does not complete a clockwise rotation.', [
 [2, 'The first off-diagonal swap exchanges matrix[0][1] and matrix[1][0]. Which values trade places?', '2 and 4', '1 and 9', '2 and 8', 'Transposition exchanges row and column coordinates.'],
 [9, 'After transposition the top row is [1, 4, 7]. What does reversing it produce?', '[7, 4, 1]', '[1, 7, 4]', '[3, 2, 1]', 'Row reversal flips the transposed row horizontally.'],
 [14, 'Where is the completed rotated matrix stored?', 'In the original matrix', 'Only in a new result matrix', 'In the temporary swap variable', 'Every swap and row reversal updates the same matrix in place.']
], ['indexing','assignment','references']);
lesson(49, 'Group words with identical letter counts into the same anagram bucket.', 'A signature must preserve counts, not merely which letters occur.', [
 [4, 'Why do eat and tea produce the same map key?', 'They contain the same count of each letter', 'They start with the same letter', 'Every three-letter word uses one key', 'Anagram order may differ, but the full letter-frequency vector is unchanged.'],
 [14, 'The signature for tea already belongs to eat. Where is tea placed?', 'In the existing group with eat', 'In a new group because its order differs', 'It is discarded as the same word', 'A matching frequency key identifies an existing anagram group.'],
 [44, 'Which part of the map becomes the final grouped answer?', 'Its arrays of words', 'Only its frequency keys', 'Only the last word added', 'Map values hold the groups; keys only locate those groups.']
], ['maps','indexing','loops']);
lesson(50, 'Compute 2 to the tenth power using repeated squaring and the bits of the exponent.', 'An even exponent skips the accumulator multiply but still squares the base and halves the exponent.', [
 [4, 'The current exponent is 10, which is even. Should the accumulator multiply by x now?', 'No, skip that multiply', 'Yes, always multiply at every iteration', 'Return zero', 'Only an odd exponent contributes the current power block to the result.'],
 [9, 'The exponent is now 5 and x is 4. What happens to accumulator 1?', 'It becomes 4', 'It becomes 5', 'It stays 1', 'The low bit is set, so the accumulator multiplies by the current base.'],
 [22, 'What value does the completed exponentiation return?', '1024', '20', '100', 'The selected power blocks multiply to 2 raised to 10.']
], ['bits','loops','assignment']);
lesson(51, 'Place one queen per row while preventing shared columns and diagonals.', 'Diagonal conflicts depend on r - c and r + c, not only on the column.', [
 [7, 'A queen is at (0, 0). Is (1, 0) safe for the next queen?', 'No, the column is occupied', 'Yes, it is a different row', 'Yes, only diagonals matter', 'Placing one queen per row does not remove column conflicts.'],
 [11, 'After rejecting columns 0 and 1, what happens at (1, 2)?', 'Place a queen there', 'Reject it for sharing column 0', 'Record a completed board immediately', 'Column 2 and both diagonal keys are currently free.'],
 [187, 'How many valid four-queen boards are collected?', '2', '4', '16', 'Backtracking explores all safe row choices and saves only complete boards.']
], ['sets','recursion','comparison']);
lesson(52, 'Count safe queen arrangements without storing every completed board.', 'Increment the count only after all rows have a queen, not after each safe placement.', [
 [7, 'Can the second queen share column 0 with the first queen?', 'No, skip this cell', 'Yes, because the rows differ', 'Only when counting instead of storing boards', 'Counting uses exactly the same attack constraints as constructing boards.'],
 [11, 'A safe cell at (1, 2) is found. What is the next action?', 'Place the queen and continue to the next row', 'Count a whole solution immediately', 'Clear all existing queens', 'A safe partial arrangement still needs queens in the remaining rows.'],
 [187, 'What count is returned for n = 4?', '2', '8', '4', 'Exactly two complete non-attacking arrangements survive all guard checks.']
], ['sets','recursion','assignment']);
lesson(53, 'Track the best subarray ending here and the best subarray seen anywhere.', 'The running sum and the global best are different: a later bad segment must not erase an earlier record.', [
 [3, 'A prefix sum of -2 precedes the next value 1. Should the new segment keep that prefix?', 'No, restart at 1', 'Yes, keep every earlier value', 'Return -2 immediately', 'A negative prefix can only reduce a segment that includes the new value.'],
 [12, 'The current segment sums to 4 and the next value is -1. What is the best sum ending here?', '3', '-1', '4', 'Extending gives 4 + (-1) = 3, which is better than starting at -1.'],
 [26, 'What maximum contiguous sum is returned?', '6', '5', '9', 'The best segment [4, -1, 2, 1] totals six.']
], ['comparison','assignment','loops']);
lesson(54, 'Read a matrix in an inward spiral by shrinking its four boundaries.', 'Shrink each completed boundary before traversing the next side to avoid reading corners twice.', [
 [7, 'The top row 1, 2, 3 is complete. Which boundary changes?', 'top moves down to 1', 'bottom moves up to 0', 'left moves right to 2', 'The completed top row is excluded from all later passes.'],
 [12, 'After reading the right column through 9, which value begins the bottom-row pass?', '8', '9 again', '4', 'The right boundary already moved inward, so the bottom-right corner is not repeated.'],
 [25, 'Which traversal is returned for this three-by-three matrix?', '[1, 2, 3, 6, 9, 8, 7, 4, 5]', '[1, 2, 3, 4, 5, 6, 7, 8, 9]', '[5, 4, 7, 8, 9, 6, 3, 2, 1]', 'Each outer ring is consumed clockwise before the inner ring.']
], ['indexing','loops','assignment']);
lesson(55, 'Work backward to determine whether the first position can eventually reach the last.', 'A position only needs to reach the current known-good goal, not the original last index directly.', [
 [1, 'Index 3 can reach index 4, the current goal. Is index 3 a usable predecessor?', 'Yes', 'No, the jump must go past 4', 'Only if it reaches index 0', 'Reaching the goal exactly is sufficient.'],
 [4, 'Index 2 can reach the new goal at 3. Where does the goal move?', 'To index 2', 'Back to index 4', 'Outside the array', 'Each successful predecessor becomes the next goal to connect from farther left.'],
 [9, 'The goal eventually reaches index 0. What does the function return?', 'true', 'false', 'The number of jumps', 'A chain of reachable goals now connects the first position to the end.']
], ['indexing','comparison','loops']);
lesson(56, 'Combine overlapping sorted intervals into disjoint ranges.', 'Extend an overlap using the maximum endpoint so a contained interval cannot shorten the merged range.', [
 [5, 'The next interval starts at 2 and the current merged one ends at 3. Do they overlap?', 'Yes, 2 <= 3', 'No, their starts differ', 'Only if both endpoints are equal', 'Sorted intervals overlap when the next start is no greater than the current end.'],
 [6, 'Merging [1, 3] with [2, 6] produces which interval?', '[1, 6]', '[2, 3]', '[1, 9]', 'Preserve the earliest start and extend to the larger endpoint.'],
 [16, 'Which disjoint interval list is returned?', '[[1, 6], [8, 10], [15, 18]]', '[[1, 18]]', '[[1, 3], [2, 6], [8, 10], [15, 18]]', 'Gaps between 6 and 8 and between 10 and 15 remain uncovered.']
], ['comparison','assignment','loops']);
lesson(57, 'Insert a new interval into a sorted disjoint list, absorbing every overlap.', 'The grown interval can overlap later ranges, so keep checking against its updated end.', [
 [2, 'Does the new interval [2, 5] overlap the existing [1, 3]?', 'Yes', 'No, because 2 is larger than 1', 'Only if 5 equals 3', 'The existing start is within the new interval reach and the intervals are not separated.'],
 [3, 'Which range results from absorbing [1, 3] into [2, 5]?', '[1, 5]', '[2, 3]', '[1, 8]', 'Take the minimum start and maximum end.'],
 [11, 'The later [6, 9] does not overlap. What list is returned?', '[[1, 5], [6, 9]]', '[[1, 9]]', '[[2, 5], [6, 9]]', 'The merged insertion is followed by the untouched later interval.']
], ['comparison','assignment','loops']);
lesson(62, 'Count routes through a grid when every move is right or down.', 'Add the counts from the two possible previous cells; do not multiply them.', [
 [1, 'Which neighbors can be the last step into cell (1, 1)?', 'The cell above and the cell to the left', 'The two diagonal neighbors', 'The cell below and the cell to the right', 'Right and down moves can arrive only from above or from the left.'],
 [4, 'The next cell has 1 path from above and 2 from the left. What count is written?', '3', '2', '1', 'These disjoint last-step choices add: 1 + 2.'],
 [25, 'How many routes reach the bottom-right cell of this 3 by 7 grid?', '28', '21', '10', 'The bottom-right dynamic-programming cell accumulates all valid routes.']
], ['indexing','assignment','loops']);
lesson(63, 'Count right-and-down routes while treating blocked cells as impassable.', 'An obstacle has zero paths even when reachable cells sit above or beside it.', [
 [3, 'At the top-row cell (0, 1), which incoming direction contributes a route?', 'Only the left neighbor', 'Only the nonexistent top neighbor', 'Both contribute one', 'Neighbors outside the grid contribute zero.'],
 [10, 'The center cell is blocked. What path count is stored there?', '0', '2', '1', 'No valid route may enter or cross an obstacle.'],
 [19, 'How many routes avoid the center obstacle and reach the destination?', '2', '6', '0', 'One route goes around each side of the blocked center.']
], ['indexing','comparison','loops']);
lesson(64, 'Find the cheapest right-and-down route by storing the least cost to reach each cell.', 'Choose the cheaper incoming cost and then add this cell; do not choose the smaller adjacent raw grid value.', [
 [3, 'Cell (0, 1) is on the top row. Which predecessor can supply its cost?', 'Only the cell to its left', 'Only the cell below it', 'Either diagonal cell', 'No above neighbor exists on the top row.'],
 [10, 'At the center, incoming costs are 4 and 2 and this cell costs 5. What total is stored?', '7', '9', '2', 'Choose the cheaper accumulated predecessor, then add 5: min(4, 2) + 5.'],
 [19, 'What minimum total cost reaches the bottom-right cell?', '7', '9', '5', 'The destination cell stores the cheapest complete route cost, including start and destination.']
], ['indexing','comparison','assignment']);
lesson(66, 'Add one to a number represented as an array of decimal digits.', 'Carry propagation stops as soon as a digit below nine is incremented.', [
 [2, 'The rightmost digit is 3. Will adding one create a carry?', 'No, 3 is below 9', 'Yes, every increment carries', 'Only if the first digit is 1', 'A decimal digit overflows only when incrementing 9.'],
 [3, 'What replaces the rightmost 3?', '4', '0', '13', 'Increment this digit by one without changing the earlier digits.'],
 [5, 'What digit array represents the completed result?', '[1, 2, 4]', '[2, 2, 3]', '[1, 2, 3, 1]', 'The number 123 increases to 124.']
], ['indexing','assignment','comparison']);
lesson(67, 'Add binary strings from right to left, carrying whenever a column reaches two.', 'Binary carry uses division by two, not division by ten.', [
 [5, 'The first column sums to 2. Which bit is written?', '0', '1', '2', 'The output bit is sum modulo two.'],
 [6, 'What carry leaves that column with sum 2?', '1', '0', '2', 'floor(2 / 2) gives one carry into the next binary place.'],
 [23, 'What binary string results from 11 plus 1?', '100', '12', '111', 'The final carry creates a new leading bit after both input strings are exhausted.']
], ['bits','indexing','assignment']);
lesson(69, 'Find the largest integer whose square does not exceed x using binary search.', 'Record feasible candidates before searching higher; the final midpoint need not be the answer.', [
 [3, 'Candidate 2 has square 4 when x is 4. Is it feasible?', 'Yes, its square does not exceed x', 'No, it must be strictly smaller', 'Only if x is odd', 'The integer square root includes exact equality.'],
 [9, 'Candidate 3 has square 9, which is too large. Which boundary moves?', 'right = mid - 1', 'left = mid + 1', 'ans = 3', 'Larger candidates also overshoot, so discard the upper half.'],
 [11, 'Which saved integer root is returned?', '2', '3', '4', 'Two is the largest tested integer whose square is at most four.']
], ['comparison','assignment','loops']);
lesson(70, 'Count ways to climb five stairs when each move climbs one or two stairs.', 'The ground has one empty route; using zero for dp[0] loses valid two-step starts.', [
 [1, 'How many ways count as reaching step 0 before climbing?', '1: take no steps', '0: there is no route', '2: choose either move size', 'The empty route is a valid starting choice that seeds later counts.'],
 [5, 'Step 2 can follow step 1 or step 0. What count is stored for it?', '2', '1', '3', 'The routes [1, 1] and [2] are distinct last-step choices.'],
 [15, 'What total number of routes reaches step 5?', '8', '5', '10', 'The final recurrence adds dp[4] = 5 and dp[3] = 3.']
], ['indexing','assignment','loops']);
lesson(71, 'Turn an absolute path into its canonical directory form using a stack.', 'Empty segments created by repeated or trailing slashes are separators, not directory names.', [
 [1, 'Splitting the leading slash produces an empty segment. What should happen?', 'Skip the empty segment', 'Push an empty directory name', 'Move to the parent directory', 'Empty pieces and single dots leave the directory stack unchanged.'],
 [2, 'The next segment is home. What changes in the directory stack?', 'Push home', 'Pop the current directory', 'Push the slash character', 'A regular directory name adds one level to the path.'],
 [4, 'After ignoring the trailing empty segment, what path is returned?', '/home', '/home/', 'home', 'Join directory names with slashes and prepend exactly one root slash.']
], ['stack','loops','comparison']);
lesson(72, 'Find the fewest insertions, deletions, or replacements needed to change horse into ros.', 'A matching character needs no extra edit; a mismatch adds one to the cheapest smaller problem.', [
 [2, 'How many edits turn a one-character prefix into an empty string?', '1 deletion', '0 edits', '2 replacements', 'Deleting each source character is the only operation needed for an empty target.'],
 [11, 'The first characters h and r differ. Which predecessor costs are compared?', 'Delete, insert, and replace', 'Only delete', 'Only matching diagonal cells', 'A mismatch can be resolved by any one of the three permitted edits.'],
 [41, 'What is the minimum edit distance from horse to ros?', '3', '5', '1', 'The bottom-right table cell includes both complete words and stores the cheapest sequence.']
], ['indexing','comparison','assignment']);
lesson(73, 'Zero every row and column that originally contained a zero.', 'Discover all original zero locations before writing new zeros, or newly written zeros will spread too far.', [
 [5, 'The center cell is zero. What information must be marked?', 'Its row and its column', 'Only that single cell', 'Every row and every column', 'The rule affects exactly the row and column of each original zero.'],
 [6, 'Which row and column sets are recorded for the center of this matrix?', 'rows = {1}, cols = {1}', 'rows = {0}, cols = {0}', 'rows = {0,1,2}, cols = {0,1,2}', 'Coordinates are zero-based, so the center lies at row 1 and column 1.'],
 [26, 'Which cells become zero after the second pass?', 'All cells in row 1 or column 1', 'Only the center', 'Every cell including all four corners', 'Membership in either recorded set triggers zeroing.']
], ['sets','indexing','assignment']);
lesson(74, 'Search a row-wise sorted matrix as though it were one sorted array.', 'Convert the virtual midpoint with the column count, not the row count.', [
 [3, 'How is a virtual midpoint mapped into its matrix cell?', 'row = floor(mid / n), col = mid % n', 'row = mid % n, col = floor(mid / n)', 'row = mid, col = mid', 'Each complete group of n positions fills one matrix row.'],
 [5, 'The midpoint cell is too large. Which virtual bound shrinks?', 'right becomes mid - 1', 'left becomes mid + 1', 'Both bounds become zero', 'Every later virtual position contains an equal or larger value.'],
 [20, 'A later midpoint equals the target. What is returned?', 'true', 'The whole row', 'false', 'This search reports whether the target exists, rather than returning its coordinates.']
], ['indexing','comparison','loops']);
lesson(75, 'Sort zeros, ones, and twos by maintaining three finished regions and one unexamined region.', 'After swapping a two with the high end, recheck the new middle value before advancing.', [
 [2, 'The middle scanner sees a 2. Which region should receive it?', 'The back region', 'The front region', 'The finished ones region', 'Twos belong after every zero and one.'],
 [4, 'A value was swapped in from the high end. What happens to mid?', 'It stays in place to inspect that value', 'It always advances', 'It jumps to high', 'The incoming value came from the unexamined region and is not classified yet.'],
 [26, 'Which array remains when the unexamined region becomes empty?', '[0, 0, 1, 1, 2, 2]', '[2, 2, 1, 1, 0, 0]', '[0, 1, 2, 0, 1, 2]', 'The completed zero, one, and two regions meet without any unexamined cells.']
], ['indexing','assignment','comparison']);
lesson(76, 'Find the shortest contiguous window containing every required character with its required count.', 'Distinct satisfied characters and total window length measure different things.', [
 [6, 'Adding C now satisfies the last missing requirement. What happens to have?', 'It reaches 3, matching needCount', 'It becomes the window length 6', 'It resets to zero', 'have counts required character kinds whose frequency is sufficient.'],
 [8, 'Shrinking removes the only A. Is the window still valid?', 'No, one required count is now too small', 'Yes, it still contains B and C', 'Yes, shorter windows are always valid', 'A valid window must cover every required multiplicity simultaneously.'],
 [34, 'Which shortest covering substring is returned?', 'BANC', 'ADOBEC', 'ABC', 'BANC appears contiguously in the input and contains A, B, and C in four positions.']
], ['maps','indexing','comparison']);
lesson(77, 'Choose every two-number combination from 1 through 4 without counting different orders separately.', 'Recurse from i + 1 so a value cannot repeat and a reversed copy cannot reappear.', [
 [4, 'After choosing 1, where should the next candidate range begin?', 'At 2', 'At 1 again', 'At 0', 'The next number must be larger than the last chosen one.'],
 [10, 'The path [1, 2] reaches the required size two. What happens?', 'Record the complete combination', 'Append another number', 'Reject it because it is increasing', 'A combination is complete when path.length equals k.'],
 [69, 'How many two-number combinations of four values are returned?', '6', '12', '4', 'Each unordered pair is collected once: 12, 13, 14, 23, 24, and 34.']
], ['recursion','loops','comparison']);
lesson(78, 'Generate the power set by making an include-or-exclude choice for each input value.', 'Copy a completed subset before later backtracking changes the working path.', [
 [4, 'The first branch includes nums[0] = 1. What does the path become?', '[1]', '[]', '[1, 2, 3]', 'The include branch appends exactly the current value.'],
 [8, 'The next include branch chooses 2 while keeping 1. What path is built?', '[1, 2]', '[2]', '[1, 1]', 'Moving to the next index preserves earlier choices until their branch is undone.'],
 [83, 'How many subsets do three distinct values produce, including the empty subset?', '8', '6', '3', 'Three independent binary choices produce 2 * 2 * 2 subsets.']
], ['recursion','stack','assignment']);
lesson(79, 'Spell a word by walking adjacent board cells without reusing a cell within one path.', 'Restore a visited cell after a recursive attempt so other search paths may use it.', [
 [3, 'The first A matches the word. Why is its board cell temporarily marked?', 'To prevent using this same cell twice in the current path', 'To remove A from every future search permanently', 'To mark the whole row unusable', 'Visited state belongs to one recursive path, not the entire board search.'],
 [6, 'The downward neighbor is S but the next required letter is B. What does this branch return?', 'false', 'true', 'The remaining word', 'A character mismatch cannot extend the required prefix.'],
 [42, 'A path spells every letter and restores the board. What does exist return?', 'true', 'The number of letters', 'false because earlier branches failed', 'One complete successful path is enough even if other candidate branches failed.']
], ['recursion','indexing','assignment']);
lesson(81, 'Search a rotated array that may contain duplicate values.', 'Always check for the target first; duplicate-boundary shrinking is needed only when equality obscures the sorted half.', [
 [2, 'Which candidate is tested first inside the current inclusive range?', 'The midpoint floor((left + right) / 2)', 'Only the left endpoint', 'An arbitrary duplicate', 'Binary search first inspects the middle of the remaining range.'],
 [3, 'The midpoint already equals the target. Must the algorithm resolve duplicate ambiguity first?', 'No, it can return true immediately', 'Yes, scan every duplicate first', 'Yes, sort the array first', 'A direct equality match answers the existence question regardless of rotation.'],
 [5, 'What final result does this example report?', 'The target exists: true', 'Its number of occurrences', 'The rotation offset', 'This version returns a boolean existence result.']
], ['indexing','comparison','loops']);
lesson(84, 'Use an increasing stack to discover the widest rectangle supported by each histogram height.', 'A popped bar spans until the current shorter bar and begins after the remaining previous shorter bar.', [
 [5, 'Height 1 arrives after height 2. What happens to the taller bar on the stack?', 'Pop it and measure its finished rectangle', 'Keep it waiting for a later shorter bar', 'Discard it without measuring', 'The first shorter bar closes the popped height on its right side.'],
 [6, 'The popped height is 2 and its width is 1. What area updates the record?', '2', '3', '1', 'Rectangle area is height times the number of covered bars.'],
 [33, 'After the sentinel flushes the remaining stack, what maximum area is returned?', '10', '6', '12', 'The height-five rectangle covering two neighboring bars gives the best area.']
], ['stack','indexing','comparison']);
lesson(88, 'Merge two sorted arrays into the spare slots at the end of nums1.', 'Write from right to left so unread values in nums1 are not overwritten.', [
 [2, 'The remaining largest values are 3 and 6. Which one belongs in the final slot?', '6 from nums2', '3 from nums1', 'The first unused zero placeholder', 'The largest remaining value fills the rightmost available slot.'],
 [4, 'After placing 6 at the tail, which direction does the write pointer move?', 'One position left', 'One position right', 'Back to index zero', 'The completed suffix grows while the unused write region shrinks leftward.'],
 [19, 'Which array is stored in nums1 when merging finishes?', '[1, 2, 2, 3, 5, 6]', '[1, 2, 3, 0, 0, 0]', '[6, 5, 3, 2, 2, 1]', 'The merge preserves both copies of 2 and all other input values in ascending order.']
], ['indexing','assignment','comparison']);
lesson(90, 'List every distinct subset when equal input values occur.', 'Skip equal choices only at the same recursion level; deeper paths may include another equal occurrence.', [
 [4, 'What subset is recorded before any value is chosen?', 'The empty subset', 'Only the full array', 'No subset can be recorded yet', 'Every recursion node represents a valid subset, including the empty root path.'],
 [10, 'After choosing 1, what additional subset is copied into the result?', '[1]', '[1, 1]', '[2, 2]', 'Record the current path before extending it with later positions.'],
 [52, 'How many distinct subsets are returned for [1, 2, 2]?', '6', '8', '3', 'Duplicate sibling branches are skipped while [], [1], [2], [1,2], [2,2], and [1,2,2] remain.']
], ['recursion','indexing','comparison']);
lesson(91, 'Count ways to split a digit string into letter codes from 1 through 26.', 'A zero cannot decode alone, and a two-digit code must lie between 10 and 26.', [
 [1, 'The first character is 2. Can a valid decoding start here?', 'Yes, 2 is a nonzero single-digit code', 'No, only two-digit codes are allowed', 'Only if it is followed by zero', 'Digits 1 through 9 each map to one letter on their own.'],
 [6, 'The prefix 22 has a single-digit split and a valid two-digit code. How many decodings does it have?', '2', '1', '22', 'The branches 2|2 and 22 are distinct valid partitions.'],
 [10, 'How many ways decode the full string 226?', '3', '2', '6', 'The partitions are 2|2|6, 22|6, and 2|26.']
], ['indexing','comparison','assignment']);
lesson(92, 'Reverse only positions 2 through 4 by repeatedly moving the next node to the front of that section.', 'The section predecessor stays fixed while curr becomes the tail of the reversed portion.', [
 [6, 'Which node does curr identify at the start of the reversal?', 'The first node of the selected section', 'The dummy node', 'The last node of the whole list', 'curr starts at prev.next and stays at the back of the growing reversed section.'],
 [11, 'After unlinking next and pointing it at the old section front, what does prev.next become?', 'next, the new section front', 'Null', 'The node after the entire section', 'Head insertion reconnects the moved node immediately after the fixed predecessor.'],
 [19, 'What list results after reversing positions 2 through 4?', '[1, 4, 3, 2, 5]', '[5, 4, 3, 2, 1]', '[1, 3, 2, 4, 5]', 'Only the inclusive middle section changes order; outer nodes remain attached.']
], ['references','assignment','loops']);
lesson(94, 'Traverse a binary tree in left-subtree, node, right-subtree order.', 'Visit a node only after its left subtree; entering the recursive call is not yet an inorder visit.', [
 [3, 'On entering node 1, which work comes before recording its value?', 'Traverse its left subtree', 'Traverse its right subtree', 'Record all remaining nodes immediately', 'Inorder places the current node between its two subtrees.'],
 [5, 'Node 1 has no left subtree. What value is appended now?', '1', '2', '3', 'An empty left call returns immediately, making the current node ready to visit.'],
 [21, 'Which inorder sequence is returned?', '[1, 3, 2]', '[1, 2, 3]', '[3, 2, 1]', 'Node 3 is in node 2\'s left subtree and must appear before 2.']
], ['recursion','references','functions']);
lesson(97, 'Check whether two strings can weave into a target while preserving each source string order.', 'A matching character is usable only if the preceding prefix state was reachable.', [
 [3, 'The target begins with a, but s2 begins with d. Can the first target character come only from s2?', 'No', 'Yes, any source character can be reordered', 'Yes, because total lengths match', 'Interleaving preserves each source order and requires the next available character to match.'],
 [8, 'The first character of s1 is a and the empty state is reachable. What happens at dp[1][0]?', 'It becomes true', 'It stays false', 'It stores the number 1 as a length', 'A valid prior state plus a matching next character makes the new prefix reachable.'],
 [38, 'What does the final table cell report for this example?', 'The target is a valid interleaving', 'The strings must be sorted first', 'Only equal-length sources can interleave', 'Both sources are fully consumed in a reachable final state.']
], ['indexing','comparison','assignment']);
lesson(98, 'Validate a search tree by carrying the allowed value range down every branch.', 'Checking only a node against its parent misses constraints inherited from earlier ancestors.', [
 [2, 'When descending left from root 2, what upper bound is passed down?', '2, excluded', 'Infinity', '1, included', 'Every node in the left subtree must be strictly smaller than 2.'],
 [6, 'When moving to the root\'s right subtree, what lower bound applies?', '2, excluded', 'Negative infinity', '3, included', 'Every right-subtree descendant must be strictly larger than the root.'],
 [10, 'Nodes 1, 2, and 3 all satisfy their inherited bounds. What is returned?', 'true', 'false because the leaves differ', 'The sorted array', 'All nodes respect both lower and upper constraints.']
], ['recursion','comparison','references']);
lesson(100, 'Compare two trees in lockstep, checking both structure and node values.', 'Equal traversal values alone do not prove equal structure; corresponding missing children must match too.', [
 [2, 'The two root values are both 1. What still needs checking?', 'Both corresponding child subtrees', 'Nothing; equal roots prove equal trees', 'Only the number of nodes', 'Equality requires every corresponding node and child position to agree.'],
 [6, 'Both corresponding child positions are null. What does this branch return?', 'true', 'false', 'A new empty node', 'Two missing children have matching empty structure.'],
 [21, 'Every corresponding value and child structure matches. What is returned?', 'true', 'The common root value 1', 'false because they are separate objects', 'The problem compares tree contents and structure rather than object identity.']
], ['recursion','references','comparison']);
lesson(102, 'Read a tree one depth level at a time with a first-in-first-out queue.', 'Capture the queue size before processing a level so newly added children belong to the next level.', [
 [4, 'Only root 3 is queued when this level begins. How many nodes belong to this level?', '1', '3', 'All nodes eventually enqueued', 'The captured size freezes the boundary between current-level nodes and their children.'],
 [9, 'Root 3 was processed and its children were queued. Which completed level is saved?', '[3]', '[3, 9, 20]', '[9, 20]', 'Children wait in the queue for the next outer iteration.'],
 [34, 'Which grouped level order is returned?', '[[3], [9, 20], [15, 7]]', '[[3, 9, 20, 15, 7]]', '[[15, 7], [9, 20], [3]]', 'Each result array contains nodes at exactly one depth, from top to bottom.']
], ['queue','loops','references']);
lesson(104, 'Compute tree depth by combining the depths returned from each child.', 'A missing subtree has depth zero, while a leaf has depth one.', [
 [5, 'A recursive call reaches null. Which depth should it return?', '0', '1', '-1', 'There are no nodes in an empty subtree.'],
 [8, 'Leaf 9 has left and right depths both zero. What depth does it return?', '1', '0', '2', 'Count the current node plus the deeper child: 1 + max(0, 0).'],
 [27, 'The root receives child depths 1 and 2. What is the complete tree depth?', '3', '2', '4', 'The longest downward root-to-leaf chain contains the root and its deeper two-node subtree.']
], ['recursion','functions','comparison']);
lesson(105, 'Rebuild a tree by taking roots from preorder and finding subtree boundaries in inorder.', 'The inorder root position determines subtree size; dividing both arrays at the same raw index is incorrect.', [
 [1, 'Which traversal value identifies the root of the current subtree?', 'The first value in its preorder slice', 'The first value in its inorder slice', 'The last value in its preorder slice', 'Preorder visits each subtree root before its children.'],
 [3, 'Root 3 is at inorder index 1. How many values belong to its left subtree?', '1', '3', '0', 'Values before the root in the inorder slice form the left subtree.'],
 [37, 'What has the recursion produced at completion?', 'The tree consistent with both input traversals', 'A sorted linked list', 'Only a copy of the preorder array', 'Each root has been attached to recursively rebuilt left and right subtrees.']
], ['recursion','indexing','references']);
lesson(110, 'Check balance at every tree node while computing subtree heights.', 'A balanced root alone is insufficient if a deeper node is unbalanced.', [
 [6, 'What height does an empty child return?', '0', '1', 'The root height', 'Height counts actual nodes along the longest child path.'],
 [9, 'Leaf 9 has child heights 0 and 0. Does it violate the balance condition?', 'No, the difference is 0', 'Yes, both children must exist', 'Yes, a leaf has no balance information', 'A node is balanced when its child heights differ by at most one.'],
 [33, 'All nodes satisfy the height-difference rule. What is returned?', 'true', 'The height 3', 'false because the root child heights differ', 'A difference of one is allowed, and the public result is a boolean.']
], ['recursion','comparison','assignment']);
lesson(115, 'Count how many ways a source string can drop characters to form a target.', 'When characters match, add both using and skipping that source character; one match does not force its use.', [
 [1, 'How many subsequences form an empty target from an empty source?', '1', '0', 'Infinitely many', 'Choosing no characters is one valid subsequence.'],
 [10, 'The first r matches the target r. Which extra count is added to the skip branch?', 'The diagonal count for using this r', 'The entire source length', 'The right-neighbor count', 'Using matching characters advances both prefixes, represented by the diagonal predecessor.'],
 [93, 'How many source subsequences spell rabbit in this example?', '3', '1', '7', 'Different choices among the repeated b characters yield three valid source-index selections.']
], ['indexing','comparison','assignment']);
lesson(121, 'Find the best profit from one buy followed by one later sale.', 'The buy day must precede the sell day; a lower future price cannot fund an earlier sale.', [
 [2, 'A new price 1 is lower than the current buy price 7. What should change?', 'Use this cheaper day as the buy candidate', 'Sell immediately for a negative profit', 'Keep buying at 7 forever', 'For every later sale, the cheaper past buy price is at least as good.'],
 [8, 'Buying at 1 and selling at 5 gives what best profit so far?', '4', '5', '6', 'Profit is sell price minus buy price: 5 - 1.'],
 [22, 'What maximum single-transaction profit is returned?', '5', '7', '6', 'The best single trade buys at 1 and sells later at 6.']
], ['indexing','comparison','assignment']);
lesson(122, 'With unlimited non-overlapping trades, collect every positive adjacent-day price increase.', 'Falling days add no profit; do not subtract their losses from gains you could avoid.', [
 [2, 'The price falls from 7 to 1. Should this day-to-day move contribute profit?', 'No', 'Yes, add 6', 'Yes, subtract 6', 'You may stay out of a losing move rather than hold a required position.'],
 [6, 'The next price rises from 1 to 5. How much profit is added?', '4', '5', '1', 'Capture the positive price difference.'],
 [18, 'What total profit results from collecting every upward move?', '7', '5', '0', 'The rises from 1 to 5 and from 3 to 6 contribute four plus three.']
], ['indexing','comparison','loops']);
lesson(124, 'Find the highest-sum connected path anywhere in a tree, allowing it to turn at one node.', 'A parent may extend only one child branch; returning both branches upward would create a fork instead of a path.', [
 [5, 'A child pointer is null. What gain can that empty branch contribute?', '0', 'Negative infinity', 'The parent value again', 'An absent branch contributes no nodes and no added value.'],
 [11, 'Node 2 is a leaf. What single-branch gain does it return upward?', '2', '0', '4', 'Return the node value plus the best nonnegative child gain.'],
 [26, 'For root 1 with children 2 and 3, what is the maximum path sum?', '6', '4', '3', 'The complete best path goes 2 to 1 to 3, using both branches only at its turning node.']
], ['recursion','references','comparison']);
lesson(125, 'Check a phrase for palindrome symmetry while ignoring non-alphanumeric characters and case.', 'Skip punctuation before comparing letters, and compare normalized case on both sides.', [
 [5, 'The normalized boundary letters match. What should the pointers do?', 'Both move inward', 'Both move outward', 'Return false immediately', 'A matching pair is finished, so the remaining work lies strictly between it.'],
 [7, 'The left pointer reaches punctuation. What happens next?', 'Advance left without comparing that character', 'Compare punctuation against a letter', 'Delete the whole remaining phrase', 'Only letters and digits participate in this palindrome comparison.'],
 [66, 'The pointers finish without a mismatch. What is returned?', 'true', 'The cleaned string', 'false because spaces were skipped', 'Every participating mirrored pair matched after case normalization.']
], ['indexing','comparison','loops']);
lesson(127, 'Find the shortest chain of dictionary words that changes one letter per step.', 'BFS levels count words including the starting word, not only the number of edits.', [
 [1, 'The destination cog exists in the dictionary. Is the initial feasibility check satisfied?', 'Yes, BFS may begin', 'No, it must already equal hit', 'Only if every dictionary word is used', 'A valid ladder must end at an allowed dictionary word.'],
 [9, 'Changing hit to hot finds an unvisited dictionary word. What happens to hot?', 'Mark it visited and add it to the next frontier', 'Return the final answer immediately', 'Leave it unvisited until every neighbor is processed', 'Marking on discovery prevents duplicate work while BFS preserves shortest distances.'],
 [53, 'cog is first reached at level 5. What length is returned?', '5 words', '4 words', '6 words', 'The shortest ladder includes both hit and cog in its word count.']
], ['queue','sets','loops']);
lesson(128, 'Find the longest run of consecutive integer values without sorting the input.', 'Start counting only at a value with no predecessor, otherwise the same run is repeatedly rescanned.', [
 [3, 'The set lacks 99 but contains 100. Is 100 a valid place to begin a run?', 'Yes, its predecessor is absent', 'No, it is too large', 'Only if it occurs first in sorted order', 'A missing predecessor identifies the smallest value of that run.'],
 [8, 'The set contains 3 when the scan considers 4. What should happen?', 'Skip starting a new count at 4', 'Count the same run again from 4', 'Remove 3 from the set', 'A longer run beginning earlier already owns value 4.'],
 [29, 'What longest consecutive length is returned?', '4', '6', '200', 'The values 1, 2, 3, and 4 form the longest run; input order does not matter.']
], ['sets','comparison','loops']);
lesson(130, 'Capture O regions surrounded by X while preserving any region connected to the border.', 'Diagonal contact does not make a region connected; only the four orthogonal neighbors count.', [
 [13, 'An O at border cell (3, 1) is reached. Should it be protected or captured?', 'Protect it by marking it safe', 'Capture it immediately', 'Protect every O in the board', 'A border connection guarantees that this region is not fully surrounded.'],
 [24, 'The final pass finds an unmarked O at (1, 1). What replaces it?', 'X', 'A permanent S', 'The border O value copied into every cell', 'An O left unmarked after border searches has no path to the border.'],
 [35, 'How many cells are captured in this example?', '3', '4', '0', 'The three inner O cells are surrounded; the border-connected O survives.']
], ['recursion','indexing','assignment']);
lesson(131, 'Split a string into all possible lists of palindromic pieces.', 'Only recurse after a palindromic prefix, but continue trying longer prefixes when that branch returns.', [
 [2, 'Is the one-character prefix a a palindrome?', 'Yes', 'No, a palindrome needs two characters', 'Only if the remaining suffix is also a', 'A single character reads the same in both directions.'],
 [11, 'The chosen pieces are a, a, and b and the full string is consumed. What happens?', 'Save a copy of this complete partition', 'Join them and keep searching without saving', 'Discard all single-character pieces', 'Every piece is palindromic and together they exactly cover the input.'],
 [32, 'How many palindrome partitions are returned for aab?', '2', '3', '1', 'The valid partitions are [a, a, b] and [aa, b].']
], ['recursion','indexing','stack']);
lesson(133, 'Copy every graph node and edge while preserving cycles without sharing original node objects.', 'Record a new clone before recursing into neighbors, or a cycle can cause unbounded recursion.', [
 [3, 'A clone of node 1 was created. Why record it in visited before visiting neighbors?', 'So cycles reuse the same clone', 'So node 1 can never have neighbors', 'So original nodes are deleted', 'The original-to-copy map must already answer a recursive return to this node.'],
 [9, 'From node 2, DFS encounters node 1 again. What should it return?', 'The clone of 1 already in the map', 'A second new clone of 1', 'The original node 1', 'One original object corresponds to exactly one clone object.'],
 [38, 'What relationship should the finished cloned graph have to the original?', 'Same connections, entirely separate node objects', 'Same exact node objects', 'Same values but no edges', 'A deep copy duplicates the structure while keeping object identities independent.']
], ['maps','references','recursion']);
lesson(134, 'Choose a gas station from which a complete circular route can be driven.', 'Reset the candidate tank when changing starts, but keep the total surplus across all stations.', [
 [5, 'The tank becomes -2 at the first station. Can the current start succeed?', 'No, it runs out of fuel', 'Yes, later gas repairs an already failed leg', 'Only if the route is reversed', 'Every leg must be reachable before collecting fuel at the next station.'],
 [6, 'After this failure, where does the next candidate start move?', 'To station 1 with a fresh tank count', 'Back to station 0 with the negative tank', 'Directly to the final station without checking', 'Every start in the failed candidate segment can be discarded together.'],
 [32, 'Total gas covers total cost. Which surviving start index is returned?', '3', '0', '-1', 'The last surviving candidate completes the circuit when the overall surplus is nonnegative.']
], ['assignment','comparison','loops']);
lesson(135, 'Give each child at least one candy and more than any lower-rated immediate neighbor.', 'Use max in the second sweep so satisfying the right neighbor does not erase the left-neighbor requirement.', [
 [3, 'Rating 0 is lower than its left neighbor rating 1. Must its candy count rise?', 'No, keep one candy for now', 'Yes, every next child gets more', 'Set it to zero', 'Only a strictly higher rating requires more candy than that neighbor.'],
 [9, 'In the right-to-left sweep, the first child outranks its right neighbor. What count is required?', '2', '1', '0', 'The right neighbor has one candy, so this child needs at least two.'],
 [11, 'What minimum total is returned for candy counts [2, 1, 2]?', '5', '3', '6', 'Both neighbor inequalities hold and no individual allocation can be reduced.']
], ['indexing','comparison','loops']);
lesson(136, 'Find the unpaired value by XORing every value together.', 'XOR cancellation works for paired equal values, not for arbitrary counts of repetition.', [
 [1, 'The accumulator starts at zero. What is 0 XOR 2?', '2', '0', '4', 'Zero is the identity for bitwise XOR.'],
 [2, 'The second 2 is XORed with accumulator 2. What remains?', '0', '2', '4', 'Matching bits cancel: a value XOR itself is zero.'],
 [4, 'After the pair cancels, which unpaired number remains?', '1', '2', '0', 'The remaining single value is unaffected by the canceled pair.']
], ['bits','assignment','loops']);
lesson(138, 'Deep-copy a linked list whose nodes also point to arbitrary random targets.', 'A copied random pointer must target a copied node, never an original node.', [
 [1, 'During the first pass, what is created for the original node with value 7?', 'A new node with value 7 recorded in the map', 'A second reference to the original node', 'All possible random links immediately', 'Create each clone once before resolving links between clones.'],
 [16, 'The original node 13 points randomly to original node 7. Where should its clone point?', 'To the mapped clone of node 7', 'To the original node 7', 'To the next cloned node regardless of the original link', 'The original-to-copy map translates arbitrary links while preserving their structure.'],
 [27, 'Which node is returned when cloning is complete?', 'The mapped copy of the original head', 'The original head', 'The last copied node', 'Starting at the copied head reaches an independent list with matching next and random connections.']
], ['maps','references','loops']);
lesson(139, 'Determine whether a string can be fully split into dictionary words.', 'A dictionary substring is useful only when the prefix before it is also segmentable.', [
 [1, 'Should the empty prefix be considered segmentable?', 'Yes, using zero words', 'No, it contains no dictionary word', 'Only when the dictionary is empty', 'This base state lets the first dictionary word begin at index zero.'],
 [12, 'The prefix leet is in the dictionary and begins at a reachable split. What happens to dp[4]?', 'It becomes true', 'It stays false until every split is checked', 'It stores the word length 4', 'One valid split is enough for this boolean reachability cell.'],
 [40, 'Can leetcode be fully segmented in this example?', 'Yes: leet followed by code', 'No, the first character alone is not a word', 'Only by reordering its letters', 'Both pieces are dictionary words and together cover the complete string in order.']
], ['sets','indexing','comparison']);
lesson(140, 'Enumerate every sentence obtained by splitting a string into dictionary words.', 'A successful sentence does not end the whole search; backtrack to discover other valid partitions.', [
 [3, 'The current prefix c is absent from the dictionary. What happens?', 'Skip this prefix and try a longer one', 'Save c as a word anyway', 'Reject the entire input permanently', 'A short invalid prefix may grow into a longer valid dictionary word.'],
 [7, 'The prefix cat is a dictionary word. What action follows?', 'Choose cat and recurse on the remaining suffix', 'Return only cat as the full sentence', 'Remove every other dictionary word', 'The working path holds chosen words while recursion covers the remaining characters.'],
 [79, 'How many complete sentences are found for catsanddog?', '2', '1', '10', 'The valid splits are cat sand dog and cats and dog.']
], ['recursion','sets','stack']);
lesson(141, 'Detect a linked-list cycle by moving one pointer one link and another pointer two links.', 'Compare node references, because two different nodes may store the same value.', [
 [2, 'Before moving fast twice, what must the loop condition establish?', 'fast and fast.next both exist', 'slow and fast have equal values', 'The final list node is already known', 'Each of the two next-link reads must be safe.'],
 [5, 'After both pointers move, what does slow === fast compare?', 'Whether both refer to the same node object', 'Whether their stored numbers are equal', 'Whether they moved the same distance', 'Reference equality detects a meeting point on the actual chain.'],
 [13, 'The pointers meet at the same node after moving. What is returned?', 'true: a cycle exists', 'false: the list ended', 'The cycle length', 'Different pointer speeds meet inside a reachable cycle.']
], ['references','comparison','loops']);
lesson(143, 'Reorder nodes as first, last, second, second-last by splitting, reversing, and weaving the list.', 'Save next links before overwriting them so no remaining nodes are lost during reversal or weaving.', [
 [9, 'The second-half head is saved. Which link is cut to separate the halves?', 'The link from node 2 to node 3', 'The link from node 1 to node 2', 'The link from node 3 to node 4', 'slow ends the first half, so setting slow.next to null splits the chain at the midpoint.'],
 [26, 'The reversed second half starts at node 4. Which node should follow node 1 after the first weave link?', 'Node 4', 'Node 2', 'Node 3', 'Weave the first node of the reversed half after the first node of the front half.'],
 [37, 'What final node order does the in-place reordering produce?', '[1, 4, 2, 3]', '[4, 3, 2, 1]', '[1, 3, 2, 4]', 'Alternating the original front and back gives first, last, second, second-last without changing node values.']
], ['references','assignment','loops']);
lesson(144, 'Visit each tree node before its left and right subtrees.', 'Preorder records a node when entering it, before descending into its children.', [
 [3, 'At root 1, what value is recorded before exploring children?', '1', '3', '2', 'Preorder begins with the current node.'],
 [8, 'The traversal reaches right child 2. What value is appended before descending left to 3?', '2', '3', '1 again', 'The same node-first rule applies to every recursive subtree.'],
 [21, 'What preorder list is returned?', '[1, 2, 3]', '[1, 3, 2]', '[3, 2, 1]', 'Root 1 is followed by node 2 and then its child 3.']
], ['recursion','references','functions']);
lesson(145, 'Visit each tree node after completing both child subtrees.', 'Do not record a node on entry; postorder waits until left and right work finishes.', [
 [3, 'On entering root 1, which subtree is explored first?', 'Its left subtree', 'Its right subtree', 'Neither; record the root and return', 'Postorder follows left, right, then current node.'],
 [5, 'Root 1 has no left child. What work happens next?', 'Explore its right subtree', 'Record 1 immediately and stop', 'Restart from the root', 'The right subtree must also finish before the root is recorded.'],
 [21, 'Which postorder sequence is returned?', '[3, 2, 1]', '[1, 2, 3]', '[1, 3, 2]', 'Child 3 finishes before parent 2, and both finish before root 1.']
], ['recursion','references','functions']);
lesson(146, 'Maintain a fixed-size cache that evicts the least recently used entry.', 'A successful get refreshes recency as well as returning the stored value.', [
 [10, 'get(1) finds key 1. What additional cache change is required?', 'Refresh key 1 to the most-recent position', 'Evict key 1 immediately', 'Leave the recency order untouched', 'Both reads and writes count as recent use.'],
 [16, 'After get(1), inserting key 3 into the full cache evicts which key?', 'Key 2', 'Key 1', 'The new key 3', 'Key 2 is now the least recently used entry at the front.'],
 [37, 'At the end, get(4) finds the remaining key 4. What does it return?', '4', '-1', 'The cache capacity 2', 'A cache hit returns the stored value and moves that entry to the most-recent position.']
], ['maps','assignment','comparison']);
lesson(150, 'Evaluate postfix arithmetic by stacking numbers and reducing operators immediately.', 'The first popped operand is the right operand, which matters for subtraction and division.', [
 [5, 'The token + arrives after numbers 2 and 1. What must it consume?', 'The top two stack values', 'The next two input tokens', 'Only the top value', 'Postfix operators follow the operands they combine.'],
 [8, 'After computing 2 + 1, what is pushed back onto the stack?', '3', '2 and 1 separately', 'The symbol +', 'The computed value replaces its two operands as one reduced subexpression.'],
 [15, 'The remaining multiplication finishes. What value is returned?', '9', '6', '3', 'The expression (2 + 1) * 3 evaluates to nine.']
], ['stack','loops','assignment']);
lesson(152, 'Track both largest and smallest products ending at each position because negatives can flip their roles.', 'Compute both new extremes from the old extremes before overwriting either tracker.', [
 [2, 'The next value is 3 after starting at 2. Which maximum product ends here?', '6', '3', '5', 'Compare starting at 3 with extending the old product: 2 * 3.'],
 [8, 'The next value is -2 and the old maximum was 6. Which new minimum product is retained?', '-12', '-2', '12', 'Multiplying a large positive product by a negative number can create the smallest product.'],
 [16, 'What global maximum product survives at the end?', '6', '4', '-48', 'The earlier segment [2, 3] remains best even though later ending products change.']
], ['comparison','assignment','loops']);
lesson(153, 'Find the smallest value in a rotated sorted array by comparing the middle and right endpoint.', 'When mid is in the sorted tail, keep mid as a candidate by setting right = mid.', [
 [3, 'The middle value is larger than the right endpoint. Where is the minimum?', 'Strictly to the right of mid', 'Strictly to the left of mid', 'At mid for certain', 'The rotation drop lies in the right portion of this interval.'],
 [8, 'Now the middle value is no greater than the right endpoint. Which update keeps every candidate?', 'right = mid', 'right = mid - 1', 'left = mid + 1', 'The minimum can be mid itself or somewhere to its left.'],
 [11, 'What minimum value remains in the single-cell interval?', '1', '0', '5', 'When both bounds meet, that surviving value is the minimum.']
], ['indexing','comparison','loops']);
lesson(155, 'Support constant-time minimum queries by storing the minimum-so-far alongside each stack value.', 'Popping the smallest value must expose the previous cached minimum automatically.', [
 [1, 'The empty stack receives -2. What minimum is stored with it?', '-2', '0', 'Infinity forever', 'The first value is also the minimum of the one-element stack.'],
 [6, 'Pushing 0 above -2 creates which cached pair?', '[0, -2]', '[0, 0]', '[-2, 0]', 'The value changes to 0, but the minimum among all current entries remains -2.'],
 [20, 'After -3 is popped, what minimum is recovered from the new top?', '-2', '-3', '0', 'Earlier entries retained the minimum that applied before -3 was pushed.']
], ['stack','indexing','assignment']);
lesson(167, 'Find two numbers adding to the target in a sorted array, returning one-based positions.', 'The returned positions start at one even though JavaScript array indices start at zero.', [
 [3, 'The first endpoint sum is too large. Which pointer movement reduces it?', 'Move the right pointer left', 'Move the left pointer right', 'Move both pointers outward', 'Sorted order makes the next value on the right no larger than the current one.'],
 [6, 'The reduced pair is still too large. Which side moves again?', 'The right side', 'The left side', 'Neither, because one move was already used', 'Apply the sum comparison independently to each new pair.'],
 [10, 'The matching zero-based positions are 0 and 1. Which pair is returned?', '[1, 2]', '[0, 1]', '[2, 7]', 'Add one to each index because this problem uses one-based answer positions.']
], ['indexing','comparison','loops']);
lesson(168, 'Convert a positive spreadsheet column number into letters using a one-based alphabet.', 'Subtract one before taking the remainder because A represents one, not zero.', [
 [2, 'The input is column number 1. What adjustment makes the letter arithmetic zero-based?', 'Subtract one to get 0', 'Add one to get 2', 'Multiply by 26', 'Bijective base 26 has no zero digit, so each iteration first offsets the number by one.'],
 [4, 'Letter index zero maps to which character added to the title?', 'A', 'Z', 'The digit 0', 'Character code 65 is A, the first alphabet symbol.'],
 [7, 'After the remaining quotient becomes zero, which title is returned?', 'A', 'AA', 'Z', 'The input one needs exactly one letter.']
], ['indexing','loops','assignment']);
lesson(169, 'Find a guaranteed majority by canceling votes for different values.', 'The vote counter is a cancellation balance, not the candidate\'s total frequency.', [
 [2, 'The vote count is zero and the next value is 3. What should become the candidate?', '3', 'The array length', 'The previous candidate forever', 'With no unmatched votes, the next value starts a fresh candidate.'],
 [9, 'A value 2 opposes candidate 3 with one vote. What count remains after cancellation?', '0', '2', '1', 'One opposing value cancels one existing candidate vote.'],
 [16, 'Which candidate survives and is returned as the guaranteed majority?', '3', '2', '0', 'A value occurring more than half the time cannot be fully canceled by all other values.']
], ['comparison','assignment','loops']);
lesson(189, 'Rotate an array three positions to the right using three reversals.', 'Normalize k by the array length before selecting reversal boundaries.', [
 [1, 'What normalized rotation is used for length 7 and k = 3?', '3', '7', '4', 'Only complete rotations disappear under k modulo n.'],
 [11, 'The whole array is reversed. Which values swap when reversing its first three elements?', '7 and 5', '1 and 7', '4 and 3', 'The first segment [7, 6, 5] must recover the original relative order of the moved tail.'],
 [20, 'Which final array is the right rotation by three?', '[5, 6, 7, 1, 2, 3, 4]', '[4, 5, 6, 7, 1, 2, 3]', '[7, 6, 5, 4, 3, 2, 1]', 'The last three original values become the front in their original order.']
], ['indexing','assignment','loops']);
lesson(190, 'Reverse all 32 binary positions by removing a low bit and appending it to a growing result.', 'Process all 32 positions, including leading zeroes, and return the result as an unsigned integer.', [
 [2, 'Which operation isolates the input\'s lowest bit?', 'n & 1', 'n + 1', 'n << 1', 'AND with binary one clears every position except the least significant bit.'],
 [11, 'The next extracted bit is 1. How is it appended to the partial result?', 'Shift the result left and OR in 1', 'Shift the result right and subtract 1', 'Overwrite every result bit with 1', 'Left shift opens the lowest position for the next reversed bit.'],
 [130, 'What does the final >>> 0 conversion ensure?', 'The returned value is unsigned 32-bit', 'The result has zero set bits', 'The bits reverse a second time', 'JavaScript bitwise intermediates can be signed; unsigned shift by zero preserves bits with unsigned interpretation.']
], ['bits','assignment','loops']);
lesson(191, 'Count set bits by repeatedly clearing the lowest one-bit.', 'n & (n - 1) clears exactly one set bit; the loop count is not the number of binary positions.', [
 [1, 'The current value is 11, which is nonzero. Is there another set bit to count?', 'Yes', 'No, odd numbers have no set bits', 'Only when the value is a power of two', 'Every nonzero integer bit pattern has at least one set bit.'],
 [4, 'After clearing a second lowest set bit, what is the counter?', '2', '10', '4', 'Each clearing operation increments the count exactly once.'],
 [8, 'How many one-bits did binary 1011 contain?', '3', '4', '11', 'Three clearing operations reduce the input to zero.']
], ['bits','comparison','loops']);
lesson(198, 'Choose the richest set of nonadjacent houses on a straight street.', 'Robbing a house can combine only with the optimum two positions earlier, not with its adjacent predecessor.', [
 [4, 'The first two houses contain 1 and 2. What is the best legal total for that prefix?', '2', '3', '1', 'Adjacent houses cannot both be robbed, so choose the richer one.'],
 [7, 'At the third house worth 3, choosing it can combine with house 0 worth 1. What best total is stored?', '4', '5', '3', 'Compare skipping it for two with taking it plus the nonadjacent earlier optimum for four.'],
 [11, 'What maximum loot is returned for [1, 2, 3, 1]?', '4', '7', '5', 'Taking houses 0 and 2 beats or ties every other nonadjacent selection.']
], ['indexing','comparison','assignment']);
lesson(199, 'Read the tree one level at a time and retain the last node seen on each level.', 'The visible node may come from a left subtree when no farther-right node exists at that depth.', [
 [4, 'Only root 1 is queued at the beginning. How many nodes are in this level?', '1', '2', 'All nodes in the tree', 'Capture the queue size before appending the next level\'s children.'],
 [7, 'Root 1 is the last node of its level. What happens to its value?', 'Append 1 to the right-side view', 'Ignore it because it has children', 'Append both children instead', 'The final processed node on each left-to-right level is visible from the right.'],
 [38, 'Which right-side view is returned?', '[1, 3, 4]', '[1, 2, 5]', '[4, 3, 1]', 'The visible values are recorded from the root level downward.']
], ['queue','loops','comparison']);
lesson(200, 'Count separate land regions by flooding each newly discovered island once.', 'Increase the island count once per fresh flood, not once per land cell.', [
 [2, 'The outer scan finds unvisited land at (0, 0). What happens to the island count?', 'Increase it to 1 and start a flood', 'Increase it for every neighbor immediately', 'Leave it zero until all cells are scanned', 'One new connected land component begins one island.'],
 [4, 'Before exploring neighbors, what happens to the visited land cell?', 'Mark it as water so it cannot be counted again', 'Leave it as unvisited land', 'Turn its entire row into water without checking', 'Marking on entry prevents revisiting through a neighboring recursive branch.'],
 [78, 'All connected land was removed by one flood. How many islands are returned?', '1', '4', 'The number of original land cells', 'Connected land cells together form one island regardless of its area.']
], ['recursion','indexing','assignment']);
lesson(201, 'Find the AND of an integer range by keeping the common binary prefix of its endpoints.', 'Bits that vary anywhere in the range become zero; simply ANDing the two endpoints can keep incorrect low bits.', [
 [2, 'Endpoints 5 and 7 differ. What must happen before their stable prefix is known?', 'Shift both right and discard a low position', 'Return their larger value', 'Set every low bit to one', 'Keep removing low positions until both remaining prefixes agree.'],
 [9, 'After both endpoints become 1, how many low positions have been removed?', '2', '1', '3', 'The pairs were 5/7, then 2/3, then 1/1.'],
 [11, 'Restoring prefix 1 by shifting left twice produces what range AND?', '4', '5', '7', 'The shared high bit remains and discarded low positions are filled with zeroes.']
], ['bits','comparison','loops']);
lesson(202, 'Repeatedly replace a number with the sum of its squared digits and detect whether it reaches one.', 'Remember whole intermediate numbers to detect cycles; remembering only individual digits is insufficient.', [
 [2, 'Before transforming 19, why is it added to seen?', 'To detect a repeated whole-number state later', 'To forbid using digit 9 again', 'To count how many digits it contains', 'A repeated state means the deterministic digit-square process has entered a loop.'],
 [10, 'The digits of 19 contribute 9 squared and 1 squared. What total is accumulated?', '82', '100', '10', 'Square each digit separately, then add the squares.'],
 [58, 'The sequence reaches 1. What does the function return?', 'true', 'false', 'The original number 19', 'Reaching one is the success condition for a happy number.']
], ['sets','loops','assignment']);
lesson(206, 'Reverse a linked list by moving nodes from an unreversed chain onto a reversed chain.', 'Save curr.next before replacing it, or the remainder of the original list can become unreachable.', [
 [3, 'Before flipping the first arrow, why is its old next node saved?', 'So the rest of the original chain remains reachable', 'So the first node value can be changed', 'So a second copy of every node can be made', 'Rewiring next destroys the old forward link unless it was kept in a temporary variable.'],
 [9, 'After reversing the arrow from node 2, where does it point?', 'To node 1', 'To node 3', 'To itself', 'Each processed node points back toward the already reversed prefix.'],
 [27, 'Which pointer is returned as the new head when curr becomes null?', 'prev', 'curr', 'The old head', 'prev identifies the front of the fully reversed chain.']
], ['references','assignment','loops']);
lesson(207, 'Decide whether every course can be completed by repeatedly taking courses with no unmet prerequisites.', 'A course becomes ready only when all its incoming prerequisite edges have been removed.', [
 [6, 'Which initial course can enter the ready queue?', 'Course 0, whose indegree is zero', 'Course 3, whose indegree is two', 'Every course simultaneously', 'Indegree counts prerequisites that have not been completed yet.'],
 [18, 'Completing course 1 leaves course 3 with indegree 1. Can course 3 be queued yet?', 'No, one prerequisite remains', 'Yes, any completed prerequisite is enough', 'Only by ignoring course 2', 'All prerequisites must be satisfied before the course is ready.'],
 [23, 'Four of four courses were processed. What is returned?', 'true', 'false', 'The remaining indegrees as the answer', 'Processing every course proves there is no prerequisite cycle blocking completion.']
], ['queue','indexing','comparison']);
lesson(208, 'Store words in a trie where shared prefixes reuse paths and word endings are marked separately.', 'Finding a prefix path does not prove the prefix is a stored complete word.', [
 [17, 'The path for apple has been created. What makes it a complete stored word?', 'Mark the final node isEnd = true', 'Mark every prefix node as a complete word', 'Store apple only at the root', 'An ending flag distinguishes full words from intermediate prefixes.'],
 [50, 'After inserting apple but before inserting app, what does search(app) return?', 'false', 'true because the path exists', 'The word apple', 'The app path exists, but its endpoint has not yet been marked as a word ending.'],
 [89, 'After app is inserted too, what does search(app) return?', 'true', 'false because apple already used that path', 'The number of p nodes', 'Inserting a shorter shared-prefix word marks its existing endpoint without destroying longer words.']
], ['references','maps','comparison']);
lesson(209, 'Find the shortest contiguous positive-number window whose sum reaches a target.', 'Continue shrinking while the window qualifies, because the first qualifying window may be longer than necessary.', [
 [3, 'The first window sums to 2 with target 7. What direction should the search take?', 'Grow the right edge', 'Shrink the left edge immediately', 'Return length one', 'With positive numbers, growing can increase an insufficient sum.'],
 [15, 'Removing the leftmost 2 lowers a qualifying sum of 8 to 6. Is the window still valid?', 'No, it is now below 7', 'Yes, it used to qualify', 'Yes, every shorter window qualifies', 'After each removal, compare the updated sum against the target again.'],
 [35, 'What shortest qualifying window length is returned?', '2', '4', '1', 'The adjacent values 4 and 3 reach seven in two positions.']
], ['indexing','comparison','loops']);
lesson(210, 'Construct a valid course order by removing zero-indegree courses one at a time.', 'A topological order may not be unique; the queue gives one valid order following its insertion order.', [
 [6, 'Course 0 has no unmet prerequisites. What happens to it?', 'Add it to the ready queue', 'Discard it from the schedule', 'Wait until course 3 finishes', 'A zero-indegree course can be taken immediately.'],
 [11, 'The first ready course is dequeued. Which value is appended to the schedule?', '0', '3', 'The number of courses 4', 'The output stores completed course identifiers in dependency-safe order.'],
 [23, 'Which order does this queue traversal return?', '[0, 1, 2, 3]', '[3, 2, 1, 0]', '[]', 'Course 0 precedes 1 and 2, and both precede course 3.']
], ['queue','indexing','loops']);
lesson(211, 'Store words in a trie and support searches where a dot matches any single character.', 'A dot consumes exactly one trie edge; it does not mean an arbitrary-length suffix.', [
 [11, 'After inserting bad, which node receives the word-ending flag?', 'The d node at the end of bad', 'The root', 'Every child of the root', 'Only the complete word endpoint is marked, while shorter prefixes remain separate.'],
 [60, 'Searching .ad reaches a dot at the root. Which paths may be tried?', 'Every child edge at that position', 'Only a literal dot edge', 'Only the first alphabetic child forever', 'A wildcard branches across available children and accepts any successful continuation.'],
 [88, 'The stored word bad matches b... What does search(b..) return?', 'true', 'false because dots are not letters', 'The number of matching words', 'Each dot matches one remaining character, and a complete matching word exists.']
], ['recursion','references','comparison']);
lesson(212, 'Search a board for many dictionary words at once by following trie prefixes during DFS.', 'Stop when a prefix is absent from the trie, and prevent reusing board cells within one path.', [
 [3, 'The board starts with o and the trie has an o child. Can this path continue?', 'Yes, it is a dictionary prefix', 'No, o alone is not a full word', 'Only after every other start is searched', 'A valid prefix can be extended even before a complete word is reached.'],
 [6, 'The next candidate makes prefix oe, but no trie child exists. What happens?', 'Stop this branch immediately', 'Keep exploring every suffix anyway', 'Delete every word beginning with o', 'No dictionary word can extend a prefix that the trie does not contain.'],
 [119, 'Which dictionary words are found on this board?', '[oath, eat]', '[oath, pea, eat, rain]', '[oat, oe]', 'Only complete marked trie words spelled by valid non-repeating board paths are collected.']
], ['recursion','references','indexing']);
lesson(213, 'Choose nonadjacent houses on a circular street by solving two linear cases.', 'The first and last houses are adjacent, so a solution may not include both.', [
 [1, 'What restriction defines the first linear pass?', 'Exclude the last house', 'Require both endpoint houses', 'Exclude every middle house', 'Removing one endpoint breaks the circular adjacency into a straight street.'],
 [6, 'The first pass compares keeping 2 with taking the next house worth 3. Which best total is stored?', '3', '5', '2', 'The two houses in this pass are adjacent and cannot both be taken.'],
 [17, 'Both endpoint-exclusion passes return 3. What is the circular optimum?', '3', '6', '4', 'Choose the larger of the two valid cases rather than adding their overlapping solutions.']
], ['indexing','comparison','assignment']);
lesson(215, 'Keep only the k largest values seen so far in a min-heap.', 'The heap root is the smallest among the retained largest values, which makes it the kth largest overall.', [
 [4, 'The heap contains one value and k is 2. Should anything be removed?', 'No, its size is still within k', 'Yes, always remove the root after each push', 'Remove the largest value', 'Only excess entries must be discarded.'],
 [19, 'After inserting 1, the heap has three entries. Which value is removed to retain the largest two?', '1, the smallest value', '3, the largest value', 'The most recently scanned index', 'A min-heap exposes the weakest retained candidate at its root.'],
 [51, 'What second-largest value is returned after all inputs are processed?', '5', '6', '4', 'The retained top two values are 5 and 6, so their minimum is the second largest.']
], ['heap','comparison','loops']);
lesson(217, 'Detect whether any value appears more than once by remembering values already scanned.', 'Check for membership before inserting the current value, or every value would match itself.', [
 [3, 'The first 1 is not in the empty set. Is a duplicate known yet?', 'No', 'Yes, because the array contains 1', 'Only if its index equals its value', 'A duplicate needs an earlier occurrence of the same value.'],
 [5, 'After handling the first 1, what must the set remember?', 'That value 1 has appeared', 'Only index 0', 'Every future value before scanning', 'The set is a record of previous values, allowing later membership checks.'],
 [19, 'A later 1 is already present in the set. What is returned?', 'true', 'false', 'The total number of duplicates', 'One repeated value is enough to answer the existence question.']
], ['sets','comparison','loops']);
lesson(219, 'Find equal values whose index distance is at most k using a sliding set.', 'Remove values that leave the allowed distance window before checking the current value.', [
 [2, 'At index 0 with k = 3, must an old element leave the set?', 'No, the window has not exceeded its allowed reach', 'Yes, remove the current value before reading it', 'Remove all values every iteration', 'There are no positions older than the allowed distance yet.'],
 [5, 'The first 1 is new within the window. What should be remembered for later nearby positions?', 'Value 1 in the window set', 'Only the number of scanned positions', 'A permanent record that never expires', 'Window membership represents values close enough to the current index.'],
 [19, 'The repeated 1 occurs three positions after its earlier copy and k is 3. What is returned?', 'true', 'false because the distance must be strictly less than k', 'The distance 3', 'The distance requirement includes equality with k.']
], ['sets','indexing','comparison']);
lesson(225, 'Make a last-in-first-out stack from one first-in-first-out queue by rotating after pushes.', 'Move only the older elements behind the new one so the newest value becomes the queue front.', [
 [2, 'The queue contains only the first pushed 1. Does it need rotation?', 'No, it is already at the front', 'Yes, rotate twice', 'It must be removed before another push', 'There are zero older entries to move behind the new value.'],
 [8, 'After appending 2 and moving the old front 1 to the back, what order is the queue?', '[2, 1]', '[1, 2]', '[2]', 'The latest pushed value is now positioned to leave first.'],
 [17, 'After top and one pop, an older value remains. What does empty() return?', 'false', 'true', 'The remaining value itself', 'The logical stack is empty exactly when the backing queue has no entries.']
], ['queue','stack','loops']);
lesson(226, 'Mirror a binary tree by swapping each node\'s left and right children.', 'Swapping only the root children is incomplete; every subtree must also be inverted.', [
 [2, 'Root 4 originally has children 2 and 7. Which pair follows its swap?', 'Left 7, right 2', 'Left 2, right 7', 'Both children become 4', 'Inversion exchanges the child references without changing node values.'],
 [5, 'Node 7 originally has children 6 and 9. What does its local swap produce?', 'Left 9, right 6', 'Left 6, right 9', 'No children', 'The same left-right exchange applies recursively below the root.'],
 [44, 'Which level-order tree represents the complete mirror?', '[4, 7, 2, 9, 6, 3, 1]', '[4, 2, 7, 1, 3, 6, 9]', '[1, 3, 6, 9, 2, 7, 4]', 'All child pairs are reversed while each node stays at the corresponding mirrored depth.']
], ['references','recursion','assignment']);
lesson(229, 'Find every value occurring more than one third of the time using two candidate slots and a verification pass.', 'Voting produces possible candidates, not guaranteed answers; exact frequencies must be checked afterward.', [
 [11, 'The voting pass has finished. Can both remaining candidates be returned immediately?', 'No, recount their actual frequencies first', 'Yes, both are guaranteed majorities', 'Only the most recently chosen one is valid', 'Cancellation counts are not the original occurrence counts.'],
 [24, 'Candidate 3 occurs twice and the threshold is floor(3 / 3) = 1. Should it be included?', 'Yes, 2 is strictly greater than 1', 'No, it must occur three times', 'Only if the second candidate also passes', 'The output rule is strictly more than n divided by three.'],
 [26, 'Only candidate 3 exceeds the verified threshold. What is returned?', '[3]', '[3, 2]', '[]', 'The second candidate occurs only once and does not exceed the threshold.']
], ['comparison','assignment','loops']);
lesson(230, 'Find the kth smallest search-tree value by stopping an inorder traversal after k visits.', 'Pushing a node onto the stack is not a visit; count it only when popped after its left subtree.', [
 [2, 'Why push root 3 and descend left before counting a visit?', 'Smaller values in its left subtree must be visited first', 'The root is always the smallest value', 'The right subtree should be discarded forever', 'Inorder traverses search-tree values in ascending order.'],
 [6, 'The leftmost node 1 is popped. Which value is visited next?', '1', '3', 'The stack size', 'The leftmost pending node is the smallest unvisited value.'],
 [8, 'After the first visit k becomes zero. What does this k = 1 example return?', '1', '3', '0', 'The node that brings the remaining visit count to zero is the requested kth smallest.']
], ['stack','references','comparison']);
lesson(232, 'Implement a queue using an incoming stack and an outgoing stack.', 'Refill the outgoing stack only when it is empty, or newer values can jump ahead of older ones.', [
 [7, 'A peek is requested while the outgoing stack is empty. What is needed?', 'Transfer all incoming entries to the outgoing stack', 'Return the newest incoming value directly', 'Transfer only the oldest by indexing the middle', 'Popping and pushing the whole incoming stack reverses its order.'],
 [12, 'After moving 2 and then 1, which value is on top of the outgoing stack?', '1, the oldest entry', '2, the newest entry', 'No value because peek removes everything', 'The double reversal makes the earliest pushed value available first.'],
 [21, 'One value still remains in either stack. What does empty() return?', 'false', 'true because the incoming stack is empty', 'The number of stacks', 'The queue is empty only if both backing stacks are empty.']
], ['stack','queue','loops']);
lesson(235, 'Find the lowest ancestor shared by nodes 2 and 4 using search-tree ordering.', 'An ancestor is allowed to be one of the target nodes; equality is already a valid split point.', [
 [1, 'At root 6, both target values 2 and 4 are smaller. Which branch contains their shared ancestor?', 'The left subtree', 'The right subtree', 'Neither; return 6 immediately', 'Both targets lie on the same smaller side of the search-tree node.'],
 [2, 'At node 2, one target equals the node and the other lies to its right. What should happen?', 'Stop at this shared-ancestor split point', 'Continue right and abandon node 2', 'Return null because targets must be in different strict subtrees', 'A node is its own ancestor, so equality satisfies the stopping condition.'],
 [3, 'Which node is returned as the lowest common ancestor of 2 and 4?', 'Node 2', 'Node 6', 'Node 4', 'Node 2 is the deepest node lying on both root-to-target paths.']
], ['references','comparison','loops']);
