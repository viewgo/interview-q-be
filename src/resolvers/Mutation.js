module.exports = {
	createPost,
	deletePost,
	updatePost,
	deleteIndustry,
	updateIndustry,
	removeTagFromPost,
};

const { checkFields, splitAndTrimTags, getUserId } = require('../utils');

// Mutations/Operations for Post
async function createPost(_parent, args, context) {
  let { price, position, industryName, description, tagString, company, isPublished } = args;
  const coachID = getUserId(context);
  
  if (isPublished) {
    checkFields({ price, position, industryName, description, company });
  }
	if (tagString) {
    tagString = tagString.toLowerCase();
    const tagArray = splitAndTrimTags(tagString);
		const tagsObjArray = await addNewTags(tagArray, context);

		return Promise.all(tagsObjArray).then(tags => {
			return context.prisma.createPost({
				price,
				position,
				description,
        coachID,
        company,
        isPublished,
				industry: { connect: { name: industryName } },
				tags: { connect: tagArray },
			});
		});
	} else {
		return context.prisma.createPost({
			price,
			position,
			description,
      coachID,
      company,
      isPublished,
			industry: { connect: { name: industryName } },
		});
	}
}

async function deletePost(_parent, _args, context) {
  const id = getUserId(context);
  let foundPostTags = await context.prisma.post({coachID: id}).tags().id();
  updatedPost = await context.prisma.deletePost({ coachID: id });
  deleteDisconnectedTags(context, foundPostTags)
  return updatedPost;
}

async function updatePost(_parent, args, context) {
  let { id, price, position, description, industryName, tagString, company, isPublished } = args;
	if (tagString && industryName) {
    tagString = tagString.toLowerCase();
		const tagArray = splitAndTrimTags(tagString);
    const tagsObjArray = await addNewTags(tagArray, context);
    return await context.prisma.updatePost({
      data: {
        price,
        position,
        description,
        company,
        isPublished,
        industry: { connect: { name: industryName } },
        tags: { connect: tagArray },
      },
      where: {
        id,
      },
    });
	} else if (tagString) {
    tagString = tagString.toLowerCase();
		const tagArray = splitAndTrimTags(tagString);
    const tagsObjArray = await addNewTags(tagArray, context);
    return await context.prisma.updatePost({
      data: { price, position, description, company, isPublished, tags: { connect: tagArray } },
      where: {
        id,
      },
    });

	} else if (industryName) {
		return await context.prisma.updatePost({
			data: {
				price,
				position,
        description,
        isPublished,
        company,
				industry: { connect: { name: industryName } },
			},
			where: {
				id,
			},
		});
	} else {
		//If no industry and tagname
		return await context.prisma.updatePost({
			data: { price, position, description, isPublished, company },
			where: {
				id,
			},
		});
  }
}

// Mutations/Operations for Industry
function deleteIndustry(_parent, args, context) {
	return context.prisma.deleteIndustry({ id: args.id });
}

function updateIndustry(_parent, args, context) {
	return context.prisma.updateIndustry({
		data: { args },
		where: {
			id,
		},
	});
}

async function removeTagFromPost(_parent, args, context) {
	const { id, tagID } = args;

	const updatedPost = await context.prisma.updatePost({
		data: { tags: { disconnect: { id: tagID } } },
		where: { id },
  });
  await deleteDisconnectedTags(context, [{id: tagID}]);
  return updatedPost
}

// Mutations/Operations for Tag
function addNewTags(array, context) {
	return array.map(async tag => {
		return await context.prisma.upsertTag({
			where: {
				name: tag.name,
			},
			create: {
				name: tag.name,
			},
			update: {
				name: tag.name,
			},
		});
	});
}

function deleteDisconnectedTags(context, tags) {
  return Promise.all(tags.map(async tag => {
    if (await context.prisma.postsConnection({where: {tags_some: {id: tag.id}}}).aggregate().count() === 0) {
      return await context.prisma.deleteTag({id: tag.id});
    }
  }));
}
