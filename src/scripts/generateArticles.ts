import { faker } from "@faker-js/faker";
import db from "../models";
import dotenv from "dotenv";

dotenv.config();

const generateFakeArticles = async (numArticles: number, batchSize: number = 1000) => {
  try {
    const users = await db.users.findAll();
    if (!users.length) {
      console.error("No users found. Please add some users first.");
      return;
    }

    const genreNames = [
      "Top", "Today", "Bangladesh", "International", "Technology",
      "Science", "Politics", "Sports", "Entertainment", "Health",
      "Business", "Recommended", "Lifestyle", "Education", "Environment",
      "Fashion", "Food", "Travel",
    ];

    const genres = await Promise.all(
      genreNames.map(async (name) => {
        const [genre] = await db.genres.findOrCreate({ where: { name } });
        return genre;
      })
    );

    const totalBatches = Math.ceil(numArticles / batchSize);

    for (let batch = 0; batch < totalBatches; batch++) {
      console.log(`Processing batch ${batch + 1} of ${totalBatches}...`);

      const newArticles = [];

      for (let i = 0; i < batchSize && batch * batchSize + i < numArticles; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];

        const articleData = {
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraphs(10),
          thumbnail: faker.image.url(),
          author_id: randomUser.id,
          totalViews: faker.number.int({ min: 0, max: 10000 }),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        };

        newArticles.push(articleData);
      }

      const createdArticles = await db.articles.bulkCreate(newArticles, {
        returning: true,
      });

      for (const article of createdArticles) {
        const numGenres = faker.number.int({ min: 1, max: 3 });
        const randomGenres = faker.helpers.arrayElements(genres, numGenres);
        await article.addGenres(randomGenres);
      }

      console.log(`Batch ${batch + 1} processed successfully.`);
    }

    console.log(`${numArticles} fake articles created successfully!`);
  } catch (error) {
    console.error("Error creating fake articles:", error);
  }
};

// Generate 5000 fake articles in batches of 500
generateFakeArticles(200, 50);