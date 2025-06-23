import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/database";

// Import models
import User, { IUser } from "../models/User";
import Dish, { IDish } from "../models/Dish";
import Menu from "../models/Menu";
import Comment from "../models/Comment";
import Rating from "../models/Rating";

// Load environment variables
dotenv.config();

// Polish dishes data - 30+ dishes
const polishDishes = [
  // Dania główne
  {
    name: "Kotlet schabowy z ziemniakami",
    description:
      "Tradycyjny kotlet schabowy panierowany w bułce tartej, podawany z gotowanymi ziemniakami",
    category: "danie główne" as const,
    imageUrl: "/api/uploads/dish-image/kotlet-schabowy.jpg",
  },
  {
    name: "Pierogi ruskie",
    description:
      "Pierogi z nadzieniem z ziemniaków i twarogu, podawane z prażoną cebulką",
    category: "danie główne" as const,
    imageUrl: "/api/uploads/dish-image/pierogi-ruskie.jpg",
  },
  {
    name: "Bigos",
    description: "Tradycyjny bigos z kapustą kiszoną, świeżą kapustą i mięsem",
    category: "danie główne" as const,
    imageUrl: "/api/uploads/dish-image/bigos.jpg",
  },
  {
    name: "Gołąbki",
    description:
      "Gołąbki z ryżem i mięsem w liściach kapusty, podawane z sosem pomidorowym",
    category: "danie główne" as const,
    imageUrl: "/api/uploads/dish-image/golabki.jpg",
  },
  {
    name: "Kurczak w sosie czosnkowym",
    description:
      "Soczyste filety z kurczaka w kremowym sosie czosnkowym z ziołami",
    category: "danie główne" as const,
    imageUrl: "/api/uploads/dish-image/kurczak-czosnkowy.jpg",
  },
  {
    name: "Kotlety mielone",
    description:
      "Domowe kotlety mielone z wołowiny i wieprzowiny z ziemniakami",
    category: "danie główne" as const,
    imageUrl: "/api/uploads/dish-image/kotlety-mielone.jpg",
  },
  {
    name: "Ryba w sosie koperkowym",
    description: "Świeża ryba w delikatnym sosie koperkowym z ziemniakami",
    category: "danie główne" as const,
    imageUrl: "/api/uploads/dish-image/ryba-koperek.jpg",
  },
  {
    name: "Schab pieczony",
    description: "Aromatyczny schab pieczony z ziołami i czosnkiem",
    category: "danie główne" as const,
    imageUrl: "/api/uploads/dish-image/schab-pieczony.jpg",
  },
  {
    name: "Placki ziemniaczane",
    description: "Tradycyjne placki ziemniaczane podawane ze śmietaną",
    category: "danie główne" as const,
    imageUrl: "/api/uploads/dish-image/placki-ziemniaczane.jpg",
  },
  {
    name: "Kluski śląskie z sosem mięsnym",
    description: "Tradycyjne kluski śląskie z sosem mięsnym i cebulą",
    category: "danie główne" as const,
    imageUrl: "/api/uploads/dish-image/kluski-slaskie.jpg",
  },

  // Zupy
  {
    name: "Żurek",
    description: "Tradycyjny żurek z kiełbasą i jajkiem w chlebie",
    category: "zupa" as const,
    imageUrl: "/api/uploads/dish-image/zurek.jpg",
  },
  {
    name: "Rosół z makaronem",
    description: "Aromatyczny rosół z kurczaka z domowym makaronem",
    category: "zupa" as const,
    imageUrl: "/api/uploads/dish-image/rosol.jpg",
  },
  {
    name: "Zupa pomidorowa",
    description: "Kremowa zupa pomidorowa z ryżem i świeżą bazylią",
    category: "zupa" as const,
    imageUrl: "/api/uploads/dish-image/zupa-pomidorowa.jpg",
  },
  {
    name: "Krupnik",
    description: "Sycąca zupa krupnik z kaszą perłową i warzywami",
    category: "zupa" as const,
    imageUrl: "/api/uploads/dish-image/krupnik.jpg",
  },
  {
    name: "Zupa ogórkowa",
    description: "Tradycyjna zupa ogórkowa z kiełbasą i ziemniakami",
    category: "zupa" as const,
    imageUrl: "/api/uploads/dish-image/zupa-ogorkowa.jpg",
  },
  {
    name: "Kapuśniak",
    description: "Aromatyczny kapuśniak z kapustą kiszoną i wędzonym mięsem",
    category: "zupa" as const,
    imageUrl: "/api/uploads/dish-image/kapusniak.jpg",
  },
  {
    name: "Zupa grzybowa",
    description: "Kremowa zupa grzybowa z leśnych grzybów",
    category: "zupa" as const,
    imageUrl: "/api/uploads/dish-image/zupa-grzybowa.jpg",
  },

  // Wegetariańskie
  {
    name: "Kotlety z soczewicy",
    description: "Kotlety z czerwonej soczewicy z warzywami i ziołami",
    category: "wegetariańskie" as const,
    imageUrl: "/api/uploads/dish-image/kotlety-soczewica.jpg",
  },
  {
    name: "Pierogi z kapustą i grzybami",
    description: "Pierogi z nadzieniem z kapusty kiszonej i grzybów",
    category: "wegetariańskie" as const,
    imageUrl: "/api/uploads/dish-image/pierogi-kapusta-grzyby.jpg",
  },
  {
    name: "Leczo wegetariańskie",
    description: "Kolorowe leczo z papryką, cukinią i pomidorami",
    category: "wegetariańskie" as const,
    imageUrl: "/api/uploads/dish-image/leczo-wegetarianskie.jpg",
  },
  {
    name: "Kasza gryczana z warzywami",
    description: "Kasza gryczana z duszonymi warzywami sezonowymi",
    category: "wegetariańskie" as const,
    imageUrl: "/api/uploads/dish-image/kasza-gryczana.jpg",
  },
  {
    name: "Naleśniki ze szpinakiem",
    description: "Naleśniki z nadzieniem ze szpinaku i sera",
    category: "wegetariańskie" as const,
    imageUrl: "/api/uploads/dish-image/nalesniki-szpinak.jpg",
  },

  // Dodatki
  {
    name: "Surówka z białej kapusty",
    description: "Świeża surówka z białej kapusty z marchewką",
    category: "dodatek" as const,
    imageUrl: "/api/uploads/dish-image/surowka-kapusta.jpg",
  },
  {
    name: "Surówka z czerwonej kapusty",
    description: "Surówka z czerwonej kapusty z jabłkiem i cebulą",
    category: "dodatek" as const,
    imageUrl: "/api/uploads/dish-image/surowka-czerwona-kapusta.jpg",
  },
  {
    name: "Mizeria",
    description: "Tradycyjna mizeria z ogórków z koperkiem",
    category: "dodatek" as const,
    imageUrl: "/api/uploads/dish-image/mizeria.jpg",
  },
  {
    name: "Surówka z marchewki",
    description: "Surówka z tartej marchewki z jabłkiem i cytryną",
    category: "dodatek" as const,
    imageUrl: "/api/uploads/dish-image/surowka-marchewka.jpg",
  },
  {
    name: "Ziemniaki gotowane",
    description: "Młode ziemniaki gotowane z koperkiem",
    category: "dodatek" as const,
    imageUrl: "/api/uploads/dish-image/ziemniaki-gotowane.jpg",
  },
  {
    name: "Ziemniaki z masłem i koperkiem",
    description: "Ziemniaki z masłem i świeżym koperkiem",
    category: "dodatek" as const,
    imageUrl: "/api/uploads/dish-image/ziemniaki-maslo.jpg",
  },

  // Desery
  {
    name: "Sernik na zimno",
    description: "Kremowy sernik na zimno z bitą śmietaną",
    category: "deser" as const,
    imageUrl: "/api/uploads/dish-image/sernik-zimno.jpg",
  },
  {
    name: "Makowiec",
    description: "Tradycyjny makowiec z nadzieniem makowym",
    category: "deser" as const,
    imageUrl: "/api/uploads/dish-image/makowiec.jpg",
  },
  {
    name: "Naleśniki z dżemem",
    description: "Słodkie naleśniki z domowym dżemem truskawkowym",
    category: "deser" as const,
    imageUrl: "/api/uploads/dish-image/nalesniki-dzem.jpg",
  },
  {
    name: "Budyń waniliowy",
    description: "Kremowy budyń waniliowy z bitą śmietaną",
    category: "deser" as const,
    imageUrl: "/api/uploads/dish-image/budyn-waniliowy.jpg",
  },
  {
    name: "Jabłecznik",
    description: "Domowy jabłecznik z cynamonem i kruszonką",
    category: "deser" as const,
    imageUrl: "/api/uploads/dish-image/jablecznik.jpg",
  },

  // Napoje
  {
    name: "Kompot z owoców sezonowych",
    description: "Kompot z sezonowych owoców",
    category: "napój" as const,
    imageUrl: "/api/uploads/dish-image/kompot.jpg",
  },
  {
    name: "Herbata czarna",
    description: "Herbata czarna Ceylon",
    category: "napój" as const,
    imageUrl: "/api/uploads/dish-image/herbata-czarna.jpg",
  },
  {
    name: "Herbata zielona",
    description: "Herbata zielona z cytryną",
    category: "napój" as const,
    imageUrl: "/api/uploads/dish-image/herbata-zielona.jpg",
  },
];

// Sample users data
const sampleUsers = [
  {
    name: "Anna Kowalska",
    email: "anna.kowalska@student.edu.pl",
    role: "student" as const,
    isApproved: true,
  },
  {
    name: "Piotr Nowak",
    email: "piotr.nowak@student.edu.pl",
    role: "student" as const,
    isApproved: true,
  },
  {
    name: "Maria Wiśniewska",
    email: "maria.wisniewska@student.edu.pl",
    role: "student" as const,
    isApproved: true,
  },
  {
    name: "Jan Kowalczyk",
    email: "jan.kowalczyk@student.edu.pl",
    role: "student" as const,
    isApproved: true,
  },
  {
    name: "Katarzyna Zielińska",
    email: "katarzyna.zielinska@student.edu.pl",
    role: "student" as const,
    isApproved: true,
  },
  {
    name: "Michał Szymański",
    email: "michal.szymanski@student.edu.pl",
    role: "student" as const,
    isApproved: true,
  },
  {
    name: "Agnieszka Dąbrowska",
    email: "agnieszka.dabrowska@student.edu.pl",
    role: "student" as const,
    isApproved: true,
  },
  {
    name: "Tomasz Kozłowski",
    email: "tomasz.kozlowski@student.edu.pl",
    role: "student" as const,
    isApproved: true,
  },
  {
    name: "Magdalena Jankowska",
    email: "magdalena.jankowska@student.edu.pl",
    role: "student" as const,
    isApproved: true,
  },
  {
    name: "Łukasz Wójcik",
    email: "lukasz.wojcik@student.edu.pl",
    role: "student" as const,
    isApproved: true,
  },
  {
    name: "Ewa Krawczyk",
    email: "ewa.krawczyk@student.edu.pl",
    role: "student" as const,
    isApproved: true,
  },
  {
    name: "Paweł Kaczmarek",
    email: "pawel.kaczmarek@student.edu.pl",
    role: "student" as const,
    isApproved: true,
  },
  {
    name: "Justyna Piotrowska",
    email: "justyna.piotrowska@student.edu.pl",
    role: "student" as const,
    isApproved: true,
  },
  {
    name: "Rafał Grabowski",
    email: "rafal.grabowski@student.edu.pl",
    role: "student" as const,
    isApproved: true,
  },
  {
    name: "Monika Pawłowska",
    email: "monika.pawlowska@student.edu.pl",
    role: "student" as const,
    isApproved: true,
  },
];

// Sample comments in Polish
const commentTemplates = [
  "Bardzo smakowite danie, polecam!",
  "Porcja mogłaby być nieco większa.",
  "Świetny smak, idealnie doprawione.",
  "Danie było ciepłe i świeże.",
  "Mogłoby być bardziej przyprawione.",
  "Doskonały stosunek jakości do ceny.",
  "Bardzo sycące i pożywne.",
  "Świetne połączenie smaków.",
  "Idealnie ugotowane, nic do zarzucenia.",
  "Tradycyjny smak, jak u babci.",
  "Bardzo ładnie podane.",
  "Mogłoby być bardziej chrupiące.",
  "Doskonała konsystencja.",
  "Bardzo zdrowe i smaczne.",
  "Brakuje odrobiny soli.",
  "Perfekcyjnie przygotowane.",
  "Świetne dla wegetarian.",
  "Bardzo orzeźwiające.",
  "Idealne na zimny dzień.",
  "Moje ulubione danie z menu!",
  "Bardzo aromatyczne.",
  "Doskonałe połączenie składników.",
  "Smak jak z dzieciństwa.",
  "Bardzo satysafkcjonujące.",
  "Mogłoby być podawane z dodatkami.",
];

// Function to generate dates between June 1, 2025 and July 14, 2025
const generateDateRange = (): Date[] => {
  const startDate = new Date("2025-06-01");
  const endDate = new Date("2025-07-14");
  const dates: Date[] = [];

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday

    // Skip weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const date = new Date(currentDate);
      date.setUTCHours(0, 0, 0, 0); // Normalize to midnight UTC
      dates.push(date);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

// Function to randomly select dishes for a menu
const selectDishesForMenu = (dishes: IDish[]): Types.ObjectId[] => {
  const shuffled = [...dishes].sort(() => 0.5 - Math.random());

  // Select 4-6 dishes per day with balanced categories
  const selectedDishes: IDish[] = [];

  // Always include at least one main dish
  const mainDishes = shuffled.filter((d) => d.category === "danie główne");
  if (mainDishes.length > 0) {
    selectedDishes.push(mainDishes[0]);
  }

  // Always include a soup
  const soups = shuffled.filter((d) => d.category === "zupa");
  if (soups.length > 0) {
    selectedDishes.push(soups[Math.floor(Math.random() * soups.length)]);
  }

  // Add 2-3 more dishes randomly from remaining categories
  const otherDishes = shuffled.filter(
    (d) =>
      d.category !== "danie główne" &&
      d.category !== "zupa" &&
      !selectedDishes.includes(d)
  );

  const additionalCount = Math.floor(Math.random() * 2) + 2; // 2-3 additional dishes
  for (let i = 0; i < additionalCount && i < otherDishes.length; i++) {
    selectedDishes.push(otherDishes[i]);
  }

  return selectedDishes.map((d) => d._id);
};

// Function to generate random rating (weighted towards higher ratings)
const generateRating = (): number => {
  const rand = Math.random();
  if (rand < 0.1) return 1;
  if (rand < 0.2) return 2;
  if (rand < 0.35) return 3;
  if (rand < 0.65) return 4;
  return 5;
};

// Main seeding function
const seedTimeRangeDatabase = async () => {
  try {
    // Connect to database
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not defined");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Połączono z MongoDB.");

    // Don't clear existing data, just add new data
    console.log(
      "Rozpoczynanie seedowania dla okresu 1 czerwca - 14 lipca 2025..."
    );

    // 1. Create users
    console.log("Tworzenie użytkowników...");
    const existingUsers = await User.find({
      role: "student",
      isApproved: true,
    });
    let allUsers = [...existingUsers];

    // Add new users if we don't have enough
    if (existingUsers.length < 10) {
      const newUsers = await User.insertMany(
        sampleUsers.slice(0, 15 - existingUsers.length)
      );
      allUsers = [...existingUsers, ...newUsers];
      console.log(`Utworzono ${newUsers.length} nowych użytkowników.`);
    }
    console.log(`Dostępnych użytkowników: ${allUsers.length}`);

    // 2. Create dishes
    console.log("Tworzenie dań...");
    const existingDishNames = (await Dish.find({}, "name")).map((d) => d.name);
    const newDishes = polishDishes.filter(
      (dish) => !existingDishNames.includes(dish.name)
    );

    let createdDishes: IDish[] = [];
    if (newDishes.length > 0) {
      createdDishes = await Dish.insertMany(newDishes);
      console.log(`Utworzono ${createdDishes.length} nowych dań.`);
    }

    // Get all dishes
    const allDishes = await Dish.find({});
    console.log(`Dostępnych dań: ${allDishes.length}`);

    // 3. Create menus for the date range
    console.log("Tworzenie menu...");
    const dateRange = generateDateRange();
    const existingMenuDates = (await Menu.find({}, "date")).map(
      (m) => m.date.toISOString().split("T")[0]
    );

    const menusToCreate = [];
    for (const date of dateRange) {
      const dateString = date.toISOString().split("T")[0];
      if (!existingMenuDates.includes(dateString)) {
        const dishIds = selectDishesForMenu(allDishes);
        menusToCreate.push({
          date,
          dishes: dishIds,
        });
      }
    }

    let createdMenus = [];
    if (menusToCreate.length > 0) {
      createdMenus = await Menu.insertMany(menusToCreate);
      console.log(`Utworzono ${createdMenus.length} menu.`);
    }

    // Get all menus for the date range
    const allMenusInRange = await Menu.find({
      date: {
        $gte: new Date("2025-06-01"),
        $lte: new Date("2025-07-14"),
      },
    }).populate("dishes");

    // 4. Create ratings
    console.log("Tworzenie ocen...");
    const ratingsToCreate = [];

    for (const menu of allMenusInRange) {
      for (const dishId of menu.dishes) {
        // Check if ratings already exist for this dish and date
        const existingRatings = await Rating.find({
          dish: dishId,
          date: menu.date,
        });

        if (existingRatings.length === 0) {
          // Each dish gets rated by 3-8 random users
          const numberOfRatings = Math.floor(Math.random() * 6) + 3;
          const shuffledUsers = [...allUsers].sort(() => 0.5 - Math.random());

          for (
            let i = 0;
            i < numberOfRatings && i < shuffledUsers.length;
            i++
          ) {
            ratingsToCreate.push({
              dish: dishId,
              student: shuffledUsers[i]._id,
              date: menu.date,
              rating: generateRating(),
            });
          }
        }
      }
    }

    if (ratingsToCreate.length > 0) {
      await Rating.insertMany(ratingsToCreate);
      console.log(`Utworzono ${ratingsToCreate.length} ocen.`);
    }

    // 5. Create comments
    console.log("Tworzenie komentarzy...");
    const commentsToCreate = [];

    for (const menu of allMenusInRange) {
      for (const dishId of menu.dishes) {
        // Check if comments already exist for this dish and date
        const existingComments = await Comment.find({
          dish: dishId,
          date: menu.date,
        });

        if (existingComments.length === 0) {
          // 30-50% chance of getting comments, 1-3 comments per dish
          if (Math.random() < 0.4) {
            const numberOfComments = Math.floor(Math.random() * 3) + 1;
            const shuffledUsers = [...allUsers].sort(() => 0.5 - Math.random());

            for (
              let i = 0;
              i < numberOfComments && i < shuffledUsers.length;
              i++
            ) {
              const status =
                Math.random() < 0.85
                  ? "approved"
                  : Math.random() < 0.5
                  ? "pending"
                  : "rejected";
              commentsToCreate.push({
                dish: dishId,
                student: shuffledUsers[i]._id,
                date: menu.date,
                text: commentTemplates[
                  Math.floor(Math.random() * commentTemplates.length)
                ],
                status,
              });
            }
          }
        }
      }
    }

    if (commentsToCreate.length > 0) {
      await Comment.insertMany(commentsToCreate);
      console.log(`Utworzono ${commentsToCreate.length} komentarzy.`);
    }

    // 6. Update dish ratings
    console.log("Aktualizowanie średnich ocen dań...");
    const ratingAggregates = await Rating.aggregate([
      {
        $group: {
          _id: "$dish",
          averageRating: { $avg: "$rating" },
          ratingCount: { $sum: 1 },
        },
      },
    ]);

    for (const aggregate of ratingAggregates) {
      await Dish.updateOne(
        { _id: aggregate._id },
        {
          $set: {
            averageRating: parseFloat(aggregate.averageRating.toFixed(2)),
            ratingCount: aggregate.ratingCount,
          },
        }
      );
    }
    console.log(`Zaktualizowano oceny dla ${ratingAggregates.length} dań.`);

    console.log("✅ Seedowanie zakończone pomyślnie!");
    console.log(`📅 Zakres dat: 1 czerwca 2025 - 14 lipca 2025`);
    console.log(`🍽️  Łączna liczba dań: ${allDishes.length}`);
    console.log(`👥 Łączna liczba użytkowników: ${allUsers.length}`);
    console.log(`📋 Menu w zakresie dat: ${allMenusInRange.length}`);
  } catch (error) {
    console.error("❌ Błąd podczas seedowania bazy danych:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Rozłączono z MongoDB.");
  }
};

// Run the seeding script
seedTimeRangeDatabase();
