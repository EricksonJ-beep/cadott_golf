export type TeeColor = 'red' | 'white' | 'blue'

export type CourseScorecard = {
  id: string
  name: string
  city: string
  holes: 9 | 18
  sourceUrl: string
  // Null indicates data has not been confirmed yet.
  parByHole: number[] | null
  hcpByHole: number[] | null
  yardageByTee: Record<TeeColor, number[] | null>
}

export const DEFAULT_TEE_COLOR: TeeColor = 'white'

export const TEE_OPTIONS: { value: TeeColor; label: string }[] = [
  { value: 'red', label: 'Red' },
  { value: 'white', label: 'White' },
  { value: 'blue', label: 'Blue' },
]

export const COURSE_SCORECARDS: CourseScorecard[] = [
  {
    id: 'northern-bay-golf-resort-arkdale',
    name: 'Northern Bay Golf Resort',
    city: 'Arkdale, WI',
    holes: 18,
    sourceUrl: '',
    parByHole: [4, 3, 3, 4, 4, 5, 4, 5, 4, 3, 5, 4, 4, 4, 5, 4, 3, 4],
    // Handicap row associated with black/blue/white tees on card.
    hcpByHole: [17, 9, 5, 1, 15, 3, 7, 13, 11, 4, 10, 8, 14, 16, 2, 12, 18, 6],
    yardageByTee: {
      red: [285, 116, 158, 331, 305, 361, 350, 426, 302, 81, 362, 321, 323, 274, 434, 345, 98, 305],
      white: [317, 154, 164, 442, 347, 565, 399, 479, 378, 127, 455, 392, 360, 336, 566, 377, 131, 430],
      blue: [327, 206, 170, 465, 364, 586, 421, 502, 411, 132, 465, 426, 373, 347, 601, 382, 150, 441],
    },
  },
  {
    id: 'river-edge-golf-course-marshfield',
    name: 'River Edge Golf Course',
    city: 'Marshfield, WI',
    holes: 18,
    sourceUrl: '',
    parByHole: [4, 5, 4, 5, 3, 4, 3, 4, 4, 4, 5, 4, 3, 5, 4, 4, 3, 4],
    hcpByHole: [10, 4, 14, 2, 16, 12, 18, 6, 8, 13, 1, 9, 15, 3, 5, 11, 17, 7],
    yardageByTee: {
      red: [284, 459, 209, 413, 154, 243, 89, 282, 300, 303, 444, 281, 128, 418, 368, 374, 109, 323],
      white: [348, 512, 265, 503, 194, 326, 128, 397, 339, 389, 488, 380, 155, 515, 422, 421, 121, 375],
      blue: [358, 541, 277, 520, 206, 341, 139, 417, 355, 389, 502, 397, 166, 530, 445, 439, 128, 395],
    },
  },
  {
    id: 'eau-claire-country-club-eau-claire',
    name: 'Eau Claire Country Club',
    city: 'Eau Claire, WI',
    holes: 18,
    sourceUrl: '',
    parByHole: [4, 4, 4, 3, 4, 3, 4, 4, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5],
    hcpByHole: null,
    yardageByTee: {
      // Mapped from available tee names on scorecard.
      red: [312, 303, 272, 149, 330, 97, 355, 311, 418, 285, 287, 132, 408, 287, 344, 113, 316, 399],
      white: [335, 339, 364, 187, 330, 131, 394, 336, 482, 344, 366, 185, 507, 337, 393, 130, 376, 458],
      blue: [417, 355, 412, 228, 431, 162, 488, 370, 532, 359, 434, 203, 518, 405, 428, 141, 461, 511],
    },
  },
  {
    id: 'whispering-pines-golf-cadott',
    name: 'Whispering Pines Golf',
    city: 'Cadott, WI',
    holes: 18,
    sourceUrl: '',
    parByHole: [4, 4, 4, 3, 4, 3, 5, 4, 5, 4, 3, 4, 4, 5, 3, 4, 5, 4],
    hcpByHole: [8, 12, 2, 16, 10, 18, 6, 14, 4, 9, 17, 11, 13, 3, 15, 1, 5, 7],
    yardageByTee: {
      red: [356, 297, 338, 112, 286, 113, 402, 194, 443, 243, 101, 295, 298, 406, 97, 301, 389, 323],
      white: [379, 333, 385, 153, 330, 129, 378, 229, 525, 319, 153, 333, 329, 545, 142, 393, 459, 400],
      blue: [421, 405, 429, 189, 348, 194, 493, 269, 607, 356, 185, 358, 354, 585, 187, 432, 489, 432],
    },
  },
  {
    id: 'lake-wissota-golf-events-chippewa-falls',
    name: 'Lake Wissota Golf & Events',
    city: 'Chippewa Falls, WI',
    holes: 18,
    sourceUrl: 'https://wissota.golf',
    // Scorecard shows a split par on hole 10 (4/5); defaulting to 4.
    parByHole: [4, 3, 5, 3, 4, 4, 5, 4, 4, 4, 3, 4, 5, 4, 4, 4, 3, 4],
    hcpByHole: null,
    yardageByTee: {
      red: [284, 122, 390, 95, 262, 309, 418, 274, 273, 331, 134, 303, 389, 275, 315, 331, 81, 229],
      white: [309, 157, 475, 126, 329, 350, 500, 330, 300, 360, 159, 364, 448, 360, 356, 426, 97, 293],
      blue: [335, 182, 496, 137, 350, 364, 515, 349, 337, 377, 184, 381, 473, 373, 391, 443, 113, 306],
    },
  },
  {
    id: 'whitetail-golf-course-colfax',
    name: 'Whitetail Golf Course',
    city: 'Colfax, WI',
    holes: 18,
    sourceUrl: '',
    parByHole: [4, 3, 5, 4, 4, 4, 3, 4, 5, 4, 3, 5, 3, 4, 4, 4, 4, 4],
    hcpByHole: [13, 15, 1, 11, 7, 9, 17, 5, 3, 10, 18, 2, 16, 12, 6, 8, 4, 14],
    yardageByTee: {
      red: [284, 109, 425, 316, 303, 273, 115, 294, 411, 295, 136, 368, 112, 230, 283, 245, 283, 230],
      white: [342, 165, 509, 401, 415, 371, 162, 392, 505, 350, 149, 454, 160, 329, 331, 322, 349, 267],
      blue: [356, 185, 520, 418, 434, 387, 186, 422, 522, 371, 192, 516, 204, 345, 351, 334, 426, 280],
    },
  },
  {
    id: 'wild-rock-golf-club-wisconsin-dells',
    name: 'Wild Rock Golf Club',
    city: 'Wisconsin Dells, WI',
    holes: 18,
    sourceUrl: '',
    parByHole: [5, 4, 4, 3, 4, 5, 4, 4, 3, 5, 3, 4, 4, 5, 3, 4, 4, 4],
    hcpByHole: [3, 13, 7, 9, 17, 1, 5, 11, 15, 2, 6, 10, 4, 8, 14, 16, 18, 12],
    yardageByTee: {
      red: [416, 329, 287, 112, 234, 457, 338, 260, 109, 399, 128, 367, 304, 407, 118, 329, 259, 302],
      white: [497, 374, 414, 164, 300, 525, 397, 362, 146, 533, 182, 403, 403, 487, 148, 381, 306, 371],
      blue: [530, 399, 446, 186, 325, 551, 460, 412, 179, 547, 223, 424, 430, 514, 166, 415, 334, 412],
    },
  },
  {
    id: 'bloomer-memorial-golf-course-bloomer',
    name: 'Bloomer Memorial Golf Course',
    city: 'Bloomer, WI',
    holes: 18,
    sourceUrl: '',
    parByHole: [4, 3, 4, 4, 5, 4, 4, 3, 4, 5, 4, 3, 5, 4, 3, 4, 4, 4],
    hcpByHole: [11, 13, 1, 17, 7, 3, 15, 9, 5, 6, 2, 18, 4, 10, 16, 8, 14, 12],
    yardageByTee: {
      red: [285, 135, 349, 201, 388, 256, 234, 150, 328, 394, 272, 84, 361, 286, 118, 269, 263, 279],
      white: [302, 146, 398, 211, 449, 341, 290, 186, 367, 443, 286, 92, 421, 328, 130, 344, 311, 323],
      blue: [318, 157, 416, 221, 452, 352, 300, 189, 371, 502, 292, 100, 428, 399, 142, 405, 329, 353],
    },
  },
  {
    id: 'hickory-hills-golf-eau-claire',
    name: 'Hickory Hills Golf',
    city: 'Eau Claire, WI',
    holes: 18,
    sourceUrl: '',
    parByHole: [4, 3, 4, 4, 3, 4, 3, 4, 4, 3, 4, 3, 3, 4, 3, 3, 4, 3],
    // Handicap row shown on scorecard (mens).
    hcpByHole: [5, 13, 1, 11, 15, 9, 17, 3, 7, 14, 4, 10, 8, 2, 18, 16, 6, 12],
    yardageByTee: {
      red: [284, 135, 279, 200, 154, 260, 116, 277, 308, 125, 221, 137, 146, 280, 85, 107, 240, 113],
      white: [330, 146, 353, 258, 157, 274, 134, 322, 317, 148, 253, 164, 163, 307, 102, 136, 268, 147],
      blue: [338, 156, 365, 268, 160, 289, 146, 330, 334, 159, 273, 178, 171, 320, 115, 154, 275, 162],
    },
  },
  {
    id: 'hayward-golf-club-hayward',
    name: 'Hayward Golf Club',
    city: 'Hayward, WI',
    holes: 18,
    sourceUrl: 'https://www.golflink.com/golf-courses/wi/hayward/hayward-golf-club',
    parByHole: [4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 3, 5, 3, 5, 4, 4, 4],
    hcpByHole: [11, 15, 13, 5, 7, 3, 1, 17, 9, 10, 6, 14, 8, 16, 4, 18, 12, 2],
    yardageByTee: {
      red: [310, 245, 125, 382, 312, 295, 323, 121, 414, 323, 334, 148, 392, 93, 407, 234, 296, 351],
      white: [368, 320, 157, 464, 325, 394, 369, 147, 500, 389, 380, 167, 468, 142, 460, 273, 378, 363],
      blue: [376, 330, 167, 496, 360, 427, 409, 174, 519, 430, 389, 197, 488, 155, 504, 280, 388, 370],
    },
  },
  {
    id: 'neillsville-country-club-neillsville',
    name: 'Neillsville Country Club',
    city: 'Neillsville, WI',
    holes: 9,
    sourceUrl: 'https://www.golflink.com/golf-courses/wi/neillsville/neillsville-country-club',
    parByHole: [4, 5, 4, 4, 3, 4, 3, 4, 5],
    hcpByHole: null,
    yardageByTee: {
      // Scorecard is presented as 18 columns: left 9 from white tees, right 9 from blue tees.
      red: [288, 368, 240, 297, 139, 268, 163, 362, 427],
      white: [330, 372, 353, 371, 185, 321, 172, 456, 497],
      blue: [337, 454, 359, 373, 145, 324, 206, 369, 504],
    },
  },
  {
    id: 'tee-hi-golf-course-medford',
    name: 'Tee Hi Golf Course',
    city: 'Medford, WI',
    holes: 9,
    sourceUrl: 'https://www.golflink.com/golf-courses/wi/medford/tee-hi-golf-club',
    parByHole: [4, 3, 3, 3, 4, 4, 3, 4, 3],
    hcpByHole: null,
    yardageByTee: {
      // Tee-Hi publishes two tee sets; map Ladies to red and Mens to white.
      red: [212, 169, 132, 133, 253, 296, 123, 288, 193],
      white: [256, 169, 132, 140, 315, 296, 155, 338, 193],
      blue: null,
    },
  },
  {
    id: 'big-fish-golf-club-hayward',
    name: 'Big Fish Golf Club',
    city: 'Hayward, WI',
    holes: 18,
    sourceUrl: 'https://www.bigfishgolf.com',
    parByHole: [4, 5, 3, 4, 4, 4, 5, 4, 3, 4, 4, 3, 5, 4, 4, 3, 5, 4],
    hcpByHole: [18, 8, 10, 2, 14, 6, 4, 16, 12, 15, 17, 13, 9, 3, 1, 11, 5, 7],
    yardageByTee: {
      blue: [378, 525, 149, 437, 337, 410, 514, 385, 123, 362, 345, 174, 487, 398, 464, 179, 524, 417],
      white: [332, 513, 137, 387, 315, 394, 484, 346, 104, 347, 285, 149, 475, 351, 420, 171, 490, 384],
      red: [269, 435, 95, 309, 242, 282, 421, 294, 86, 277, 224, 98, 401, 310, 324, 134, 397, 342],
    },
  },
  {
    id: 'marshfield-country-club-marshfield',
    name: 'Marshfield Country Club',
    city: 'Marshfield, WI',
    holes: 18,
    sourceUrl: 'https://www.golflink.com/golf-courses/wi/marshfield/marshfield-country-club',
    parByHole: [4, 3, 4, 5, 4, 3, 4, 4, 4, 4, 4, 4, 5, 3, 4, 4, 4, 3],
    hcpByHole: [5, 11, 3, 9, 7, 1, 17, 13, 15, 4, 18, 14, 2, 12, 16, 8, 6, 10],
    yardageByTee: {
      blue: [384, 164, 322, 523, 327, 208, 406, 456, 350, 330, 315, 391, 482, 142, 358, 351, 317, 168],
      white: [369, 162, 309, 506, 313, 196, 390, 410, 321, 318, 296, 383, 475, 124, 343, 346, 307, 154],
      red: [307, 147, 301, 441, 282, 184, 319, 328, 243, 312, 285, 285, 415, 110, 288, 341, 271, 144],
    },
  },
  {
    id: 'skyline-golf-club-black-river-falls',
    name: 'Skyline Golf Club',
    city: 'Black River Falls, WI',
    holes: 18,
    sourceUrl: 'https://www.golfskyline.com',
    parByHole: [4, 5, 3, 4, 4, 4, 5, 4, 3, 4, 4, 3, 5, 4, 4, 3, 5, 4],
    hcpByHole: [18, 8, 10, 2, 14, 6, 4, 16, 12, 15, 17, 13, 9, 3, 1, 11, 5, 7],
    yardageByTee: {
      // Championship (green) → blue, Member → white, Forward (red) → red
      blue: [378, 525, 149, 437, 337, 410, 514, 385, 123, 362, 345, 174, 487, 398, 464, 179, 524, 417],
      white: [332, 513, 137, 387, 315, 394, 484, 346, 104, 347, 285, 149, 475, 351, 420, 171, 490, 384],
      red: [269, 435, 95, 309, 242, 282, 421, 294, 86, 277, 224, 98, 401, 310, 324, 134, 397, 342],
    },
  },
  {
    id: 'university-ridge-golf-course-madison',
    name: 'University Ridge Golf Course',
    city: 'Madison, WI',
    holes: 18,
    sourceUrl: 'https://www.universityridge.com',
    parByHole: [4, 5, 3, 4, 3, 5, 4, 3, 5, 4, 5, 3, 4, 4, 4, 5, 3, 4],
    hcpByHole: [11, 7, 13, 1, 15, 3, 9, 17, 5, 6, 8, 18, 12, 10, 16, 4, 14, 2],
    yardageByTee: {
      blue: [376, 546, 195, 398, 172, 608, 379, 162, 554, 456, 537, 174, 330, 377, 321, 533, 192, 408],
      white: [355, 461, 170, 332, 140, 534, 325, 144, 442, 375, 462, 124, 294, 322, 280, 471, 155, 366],
      red: [293, 428, 135, 304, 126, 442, 298, 83, 421, 342, 412, 95, 222, 309, 245, 434, 130, 286],
    },
  },
]
