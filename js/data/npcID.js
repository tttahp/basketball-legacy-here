// ============================================================
// npcID.js
// ============================================================
// NPC PERSONAL IDENTITY / PERSONAL INFORMATION
//
// File này chỉ quản lý thông tin nhận dạng và thông tin cá nhân
// cơ bản của NPC.
//
// KHÔNG chứa:
// - OVR
// - Attributes
// - Role
// - Morale
// - Condition
// - Development
// - Career stats
// - Relationship
//
// Các hệ trên thuộc NPC gameplay/career.
//
// npcID là ID cố định của NPC trong toàn bộ career.
// Relationship / Event / History về sau chỉ cần lưu npcID.
// ============================================================


// ============================================================
// NAME DATA
// ============================================================

// Tên riêng.
// Có thể mở rộng database sau này mà không phải sửa generator.
const FIRST_NAMES = [

  "Alex",
  "Adam",
  "Anthony",
  "Ben",
  "Brandon",
  "Chris",
  "Daniel",
  "David",
  "Derek",
  "Ethan",
  "Eric",
  "Jack",
  "James",
  "Jason",
  "Jordan",
  "Jaylen",
  "Kevin",
  "Kemba",
  "Lucas",
  "Marcus",
  "Moses",
  "Michael",
  "Mitchell",
  "Myles",
  "Nathan",
  "Nicholas",
  "Noah",
  "Ryan",
  "Sam",
  "Thomas",
  "Peter",
  "Nguyen",
  "Tyler",
  "Tyrese",
  "Tony",
  "Tim",
  "Victor"

];


// Họ.
const LAST_NAMES = [

  "Anderson",
  "Baker",
  "Brown",
  "Brown IV",
  "Bryant",
  "Bryant III",
  "Carter",
  "Davis",
  "Evans",
  "Irving",
  "Garcia",
  "Harris",
  "Jackson",
  "Jackson II",
  "Johnson",
  "Lee",
  "Martin",
  "Miller",
  "O'Neal",
  "Parker",
  "Paul",
  "Robinson",
  "Smith",
  "Taylor",
  "Thomas",
  "Thomas V",
  "Walker",
  "West",
  "White",
  "Wilson",
  "Russell",
  "Walker II"

];


// ============================================================
// PERSONAL DATA
// ============================================================

// Giới tính.
// NPC hiện tại chỉ cần thông tin cơ bản.
const GENDERS = [

  "Male",
  "Female"

];


// Quốc tịch.
// Có thể mở rộng thêm sau.
const NATIONALITIES = [

  "USA",
  "Canada",
  "France",
  "Spain",
  "Serbia",
  "Australia",
  "Japan",
  "Brazil",
  "Argentina",
  "Germany",
  "Slovenia",
  "Vietnam",
  "Phillipin",
  "Latvia",
  "Egypt",
  "Italia",
  "Russia",
  "Korea",
  "China",
  "Thailand",
  "India",
  "Iran",
  "Qatar",
  "UAE",
  "New Zealand",
  "England",
  "Portugal",
  "Turkey",
  "Netherland"

];


// Tay thuận.
const HANDEDNESS = [

  "Right",
  "Left"

];


// ============================================================
// LOCATION DATA
// ============================================================
// Không cần database hometown quá sâu.
// Quốc gia hiện tại được dùng làm nguồn hometown mặc định.
// Sau này có thể thay bằng city database.
// ============================================================

const HOMETOWN_BY_NATIONALITY = {

  USA: [

      "Los Angeles",
      "New York",
      "Chicago",
      "Houston",
      "Atlanta",
      "Dallas",
      "Miami",
      "Phoenix",
      "Texas",
      "California",
      "Florida",
      "Washington"

  ],

  Canada: [

      "Toronto",
      "Vancouver",
      "Montreal",
      "Calgary"

  ],

  France: [

      "Paris",
      "Lyon",
      "Marseille",
      "Toulouse"

  ],

  Spain: [

      "Madrid",
      "Barcelona",
      "Valencia",
      "Seville"

  ],

  Serbia: [

      "Belgrade",
      "Novi Sad",
      "Nis"

  ],

  Australia: [

      "Sydney",
      "Melbourne",
      "Brisbane",
      "Perth",
      "Adelaile"

  ],

  Japan: [

      "Tokyo",
      "Osaka",
      "Yokohama",
      "Nagoya"

  ],

  Brazil: [

      "Sao Paulo",
      "Rio de Janeiro",
      "Brasilia",
      "Salvador"

  ],

  Argentina: [

      "Buenos Aires",
      "Cordoba",
      "Rosario"

  ],

  Germany: [

      "Berlin",
      "Munich",
      "Hamburg",
      "Frankfurt"

  ],

  Vietnam: [
      "Ho Chi Minh city",
      "Hanoi",
      "Nghe Tinh"

  ],

  Korea: [
      "Seoul",
      "Busan",
      "Incheon"

  ],

  Italia: [
      "Roma",
      "Milan",
      "Genoa"

  ],

  England: [
      "Liverpool",
      "Manchester",
      "London",
      "Birmingham"

  ]


};


// ============================================================
// RANDOM HELPERS
// ============================================================

// Random integer.
// Bao gồm cả min và max.
function randomInt(
  min,
  max
) {

  return Math.floor(
      Math.random() *
      (max - min + 1)
  ) + min;

}


// Random element trong array.
function randomChoice(
  array
) {

  return array[
      Math.floor(
          Math.random() *
          array.length
      )
  ];

}


// ============================================================
// NPC ID GENERATOR
// ============================================================
// ID được tạo một lần khi NPC được sinh.
//
// ID không phụ thuộc team/league hiện tại.
// NPC chuyển:
// School -> Draft -> BLA
//
// vẫn giữ nguyên npcID.
//
// Đây là khóa chính cho:
// - Relationship
// - Event
// - Career History
// - Rivalry
// - Former teammate
// ============================================================

function generateNPCID(
  season = 1,
  index = 1
) {

  const timestamp =
      Date.now()
          .toString(36)
          .toUpperCase();


  const randomPart =
      Math.random()
          .toString(36)
          .slice(2, 8)
          .toUpperCase();


  return (

      `NPC-` +
      `${season}-` +
      `${index}-` +
      `${timestamp}-` +
      `${randomPart}`

  );

}


// ============================================================
// NAME GENERATOR
// ============================================================
// Tạo firstName + lastName + fullName.
// ============================================================

function generateNPCName() {

  const firstName =
      randomChoice(
          FIRST_NAMES
      );


  const lastName =
      randomChoice(
          LAST_NAMES
      );


  return {

      firstName,

      lastName,

      fullName:
          `${firstName} ${lastName}`

  };

}


// ============================================================
// HOMETOWN GENERATOR
// ============================================================

function generateHometown(
  nationality
) {

  const cities =
      HOMETOWN_BY_NATIONALITY[
          nationality
      ];


  // Nếu quốc gia chưa có city database,
  // dùng Unknown thay vì crash generator.
  if (
      !cities ||
      cities.length === 0
  ) {

      return "Unknown";

  }


  return randomChoice(
      cities
  );

}


// ============================================================
// BIRTH YEAR
// ============================================================
// NPC generator truyền age hiện tại.
// Birth year được tính từ season/year hiện tại.
//
// Nếu game chưa dùng calendar year,
// seasonYear có thể mặc định 1.
//
// ============================================================

function generateBirthYear({

  currentYear = 1,

  age = 18

} = {}) {

  return (
      currentYear - age
  );

}


// ============================================================
// GENERATE NPC PERSONAL INFO
// ============================================================
// Đây là function chính mà npcGenerator.js gọi.
//
// Các thông tin gameplay KHÔNG được tạo ở đây.
//
// Input:
// - season
// - index
// - age
// - height
// - position
//
// Output:
// - npcID
// - name
// - gender
// - nationality
// - hometown
// - age
// - birthYear
// - height
// - position
// - handedness
// ============================================================

function generateNPCPersonalInfo({

  season,

  index,

  currentYear,

  age,

  height,

  position

} = {}) {


  // --------------------------------------------------------
  // NAME
  // --------------------------------------------------------

  const name =
      generateNPCName();


  // --------------------------------------------------------
  // GENDER
  // --------------------------------------------------------

  const gender =
      randomChoice(
          GENDERS
      );


  // --------------------------------------------------------
  // NATIONALITY
  // --------------------------------------------------------

  const nationality =
      randomChoice(
          NATIONALITIES
      );


  // --------------------------------------------------------
  // HOMETOWN
  // --------------------------------------------------------

  const hometown =
      generateHometown(
          nationality
      );


  // --------------------------------------------------------
  // HANDEDNESS
  // --------------------------------------------------------

  const handedness =
      randomChoice(
          HANDEDNESS
      );


  // --------------------------------------------------------
  // BIRTH YEAR
  // --------------------------------------------------------

  const birthYear =
      generateBirthYear({

          currentYear,

          age

      });


  // --------------------------------------------------------
  // RETURN PERSONAL DATA
  // --------------------------------------------------------

  return {

      // ID duy nhất và cố định.
      npcID:
          generateNPCID(
              season,
              index
          ),


      // Tên riêng.
      firstName:
          name.firstName,


      // Họ.
      lastName:
          name.lastName,


      // Tên đầy đủ.
      fullName:
          name.fullName,


      // Giới tính.
      gender,


      // Quốc tịch.
      nationality,


      // Thành phố quê quán.
      hometown,


      // Tuổi hiện tại.
      age,


      // Năm sinh.
      birthYear,


      // Chiều cao.
      height,


      // Position.
      position,


      // Tay thuận.
      handedness

  };

}


// ============================================================
// UPDATE PERSONAL INFO
// ============================================================
// Dùng khi NPC qua mùa.
//
// Không tạo NPC ID mới.
// Không random lại tên, quốc tịch, hometown...
//
// Chỉ cập nhật những thông tin có thể thay đổi theo thời gian.
// ============================================================

function updateNPCPersonalInfo(

  personalInfo,

  {

      age = null,

      height = null,

      position = null,

      currentYear = null

  } = {}

) {

  if (
      !personalInfo
  ) {

      return null;

  }


  // Tuổi tăng theo career system.
  if (
      age !== null
  ) {

      personalInfo.age =
          age;

  }


  // Chiều cao chỉ cập nhật nếu
  // hệ career truyền giá trị mới.
  if (
      height !== null
  ) {

      personalInfo.height =
          height;

  }


  // Position có thể thay đổi.
  // Ví dụ PF -> C.
  if (
      position !== null
  ) {

      personalInfo.position =
          position;

  }


  // Update birthYear nếu game
  // đang sử dụng calendar year.
  if (
      currentYear !== null
  ) {

      personalInfo.birthYear =
          generateBirthYear({

              currentYear,

              age:
                  personalInfo.age

          });

  }


  return personalInfo;

}


// ============================================================
// VALIDATE NPC PERSONAL INFO
// ============================================================
// Kiểm tra object có đủ identity cơ bản không.
//
// Không validate OVR/stat vì đó không thuộc file này.
// ============================================================

function validateNPCPersonalInfo(
  personalInfo
) {

  if (
      !personalInfo
  ) {

      return false;

  }


  // npcID bắt buộc.
  if (
      !personalInfo.npcID
  ) {

      return false;

  }


  // Tên bắt buộc.
  if (
      !personalInfo.firstName ||
      !personalInfo.lastName ||
      !personalInfo.fullName
  ) {

      return false;

  }


  // Gender bắt buộc.
  if (
      !GENDERS.includes(
          personalInfo.gender
      )
  ) {

      return false;

  }


  // Nationality bắt buộc.
  if (
      !NATIONALITIES.includes(
          personalInfo.nationality
      )
  ) {

      return false;

  }


  // Age hợp lệ.
  if (
      typeof personalInfo.age !== "number" ||
      personalInfo.age < 0
  ) {

      return false;

  }


  // Height hợp lệ.
  if (
      typeof personalInfo.height !== "number" ||
      personalInfo.height <= 0
  ) {

      return false;

  }


  // Position phải tồn tại.
  if (
      !personalInfo.position
  ) {

      return false;

  }


  return true;

}


// ============================================================
// EXPORTS
// ============================================================

export {

  // Tạo NPC ID.
  generateNPCID,

  // Tạo tên.
  generateNPCName,

  // Tạo hometown.
  generateHometown,

  // Tạo birth year.
  generateBirthYear,

  // Tạo toàn bộ personal info.
  generateNPCPersonalInfo,

  // Update personal info.
  updateNPCPersonalInfo,

  // Validate personal info.
  validateNPCPersonalInfo

};


// Default export.
// npcGenerator.js có thể import trực tiếp nếu muốn.
export default generateNPCPersonalInfo;