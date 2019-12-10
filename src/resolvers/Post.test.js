require('dotenv').config();

const request = require('supertest');

const server = require('../server');

describe('Post', () => {
	let id;
	let coachID;
	const app = server.createHttpServer({});
	const token =
		'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNrMnh0ZXB4aDAwbmgwNzcydHpyZDJyc28iLCJlbWFpbCI6ImxhYnMxOC5xdWFsaXR5aHViQGdtYWlsLmNvbSIsImlhdCI6MTU3NTk5NTczMiwiZXhwIjoxNTc2MDM4OTMyfQ.0DZ938P78DGZ724YHfvGh4T3cFmi5D3ZrAcO_wf65PM';

	it('creates a post', async () => {
		const response = await request(app)
			.post('/')
			.set({ Authorization: token })
			.send({
				query: `mutation {
          createPost(price: 10, position: "Test position", industryName: "Visual Arts", description: "Test description", tagString: "Test1, Test2", company: "McDonalds", isPublished: true ) {
						id
            coach {
              id
            }
          }
        }`,
			});
		id = response.body.data.createPost.id;
		coachID = response.body.data.createPost.coach.id;

		expect(response.body.data.createPost.id).toBeTruthy();
	});

	it('returns posts', async () => {
		const response = await request(app)
			.post('/')
			.send({
				query: `query {
        posts {
          description
        }
			}`,
			});

		expect(response.body.data.posts).toBeTruthy();
	});

	it('returns post by ID', async () => {
		const response = await request(app)
			.post('/')
			.send({
				query: `query {
                  post(id: "${id}") {
                    description
                  }
      }`,
			});

		expect(response.body.data.post.description).toBe('Test description');
	});

	it('returns post by coachID', async () => {
		const response = await request(app)
			.post('/')
			.send({
				query: `query {
						postByCoach(coach_id: "${coachID}") {
							description
            }
          }
					`,
			});
		expect(response.body.data.postByCoach.description).toBe('Test description');
	});

	it('returns the user associated with a post', async () => {});

	it('returns the industry associated with a post', async () => {
		const response = await request(app)
			.post('/')
			.send({
				query: `query {
									postByCoach(coach_id: "${coachID}") {
										industry { 
											name
										}
									}
								}
							`,
			});
		expect(response.body.data.postByCoach.industry.name).toBe('Visual Arts');
	});

	it('returns tags associated with a post', async () => {
		const response = await request(app)
			.post('/')
			.send({
				query: `query {
        post(id: "${id}") {
          tags {
            name
          }
        }
      }`,
			});

		expect(response.body.data.post.tags[0].name).toBe('test1');
		expect(response.body.data.post.tags[1].name).toBe('test2');
	});

	it('updates a post', async () => {
		const response = await request(app)
			.post('/')
			.send({
				query: `mutation {
          updatePost(id: "${id}", price: 1000, description: "I have been edited now!") {
            description
          }
        }`,
			});

		expect(response.body.data.updatePost.description).toBe(
			'I have been edited now!',
		);
	});

	it('deletes a post', async () => {
		const response = await request(app)
			.post('/')
			.set({ Authorization: token })
			.send({
				query: `mutation {
          deletePost {
            id
          }
        }`,
			});

		expect(response.body.data.deletePost.id).toBeTruthy();
	});
});
