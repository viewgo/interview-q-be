module.exports = {
    interviewQinfo,
    post,
    posts,
    postByCoach,
    industry,
    industries,
    availabilities,
    availabilitiesByCoach,
    bookings,
    bookingsByCoach,
    bookingsBySeeker,
};

function interviewQinfo() {
    return '"Welcome to InterviewQ" - love JQH';
}

// Post queries
function post(_parent, args, context) {
    return context.prisma.post({ id: args.id });
}

function posts(_parent, args, context) {
    // Create filter here
    let where = { AND: [{ isPublished: true }] };
    if (args.industry) {
        where.AND.push({ industry: { name: args.industry } });
    }
    if (args.price) {
        let prices = args.price.split(',');
        where.AND.push({ price_gte: Number(prices[0]) });
        where.AND.push({ price_lte: Number(prices[1]) });
    }
    let idx;
    if (args.tags) {
        args.tags = args.tags.toLowerCase();
        let tags = args.tags.split(',');
        idx = where.AND.push({ OR: [] });
        let nextIdx = where.AND[idx -1].OR.push({tags_some: { OR: [] } });
        // let idx where.AND.push({ tags_some: { OR: [] } });
        tags.forEach(tag => {
            where.AND[idx - 1].OR[0].tags_some.OR.push({ name_contains: tag.trim() });
            where.AND[idx - 1].OR.push({ desc_lc_contains: tag.trim() })
        });
        if (args.ids) {
          args.ids.forEach(id => {
            where.AND[idx - 1].OR.push({ coachID: id })
          })
        }
    }
    return context.prisma.posts({ where, orderBy: args.orderBy });
}

function postByCoach(_parent, args, context) {
    return context.prisma.post({ coachID: args.coach_id });
}

// Industry queries
function industry(_parent, args, context) {
    return context.prisma.posts({ where: { industry: { name: args.name } } });
}

function industries(_parent, _args, context) {
    return context.prisma.industries();
}

// Availabilities queries
function availabilities(_parents, _args, context) {
    console.log(context.prisma.availabilities());
    return context.prisma.availabilities();
}

function availabilitiesByCoach(_parents, args, context) {
    console.log(args);
    return context.prisma.availabilities({ where: { coach: args.coach_id } });
}

// Bookings queries
function bookings(_parents, _args, context) {
    console.log(context.prisma.bookings());
    return context.prisma.bookings();
}

function bookingsByCoach(_parents, args, context) {
    return context.prisma.bookings({ where: { coach: args.coach_id } });
}

function bookingsBySeeker(_parents, args, context) {
    return context.prisma.bookings({ where: { seeker: args.seeker_id } });
}