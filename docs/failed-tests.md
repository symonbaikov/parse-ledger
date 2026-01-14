cd ..
❯ docker compose up --build -d
unable to get image 'redis:7-alpine': Cannot connect to the Docker daemon at unix:///Users/symonbaikov/.docker/run/docker.sock. Is the docker daemon running?
❯ docker compose up --build -d
[+] Building 30.6s (27/35)
 => [internal] load local bake definitions                                                                                                                      0.0s
 => => reading from stdin 1.13kB                                                                                                                                0.0s
 => [backend internal] load build definition from Dockerfile                                                                                                    0.0s
 => => transferring dockerfile: 1.12kB                                                                                                                          0.0s
 => [frontend internal] load build definition from Dockerfile                                                                                                   0.0s
 => => transferring dockerfile: 1.19kB                                                                                                                          0.0s
 => [frontend internal] load metadata for docker.io/library/node:20-alpine                                                                                      0.1s
 => [backend internal] load .dockerignore                                                                                                                       0.0s
 => => transferring context: 231B                                                                                                                               0.0s
 => [frontend internal] load .dockerignore                                                                                                                      0.0s
 => => transferring context: 190B                                                                                                                               0.0s
 => [backend builder 1/8] FROM docker.io/library/node:20-alpine@sha256:6178e78b972f79c335df281f4b7674a2d85071aae2af020ffa39f0a770265435                         0.0s
 => => resolve docker.io/library/node:20-alpine@sha256:6178e78b972f79c335df281f4b7674a2d85071aae2af020ffa39f0a770265435                                         0.0s
 => [frontend internal] load build context                                                                                                                      0.0s
 => => transferring context: 6.64kB                                                                                                                             0.0s
 => [backend internal] load build context                                                                                                                       0.0s
 => => transferring context: 763.44kB                                                                                                                           0.0s
 => CACHED [backend builder 2/8] WORKDIR /app                                                                                                                   0.0s
 => CACHED [frontend builder  3/10] COPY package*.json ./                                                                                                       0.0s
 => CACHED [frontend builder  4/10] COPY tsconfig.json ./                                                                                                       0.0s
 => CACHED [frontend builder  5/10] COPY next.config.* ./                                                                                                       0.0s
 => CACHED [frontend builder  6/10] COPY tailwind.config.* ./                                                                                                   0.0s
 => CACHED [frontend builder  7/10] COPY postcss.config.* ./                                                                                                    0.0s
 => CACHED [frontend builder  8/10] RUN npm ci                                                                                                                  0.0s
 => CACHED [frontend builder  9/10] COPY . .                                                                                                                    0.0s
 => CANCELED [frontend builder 10/10] RUN npm run build                                                                                                        30.2s
 => [backend builder 3/8] COPY package*.json ./                                                                                                                 0.0s
 => CACHED [backend stage-1 3/8] RUN apk add --no-cache python3 py3-pip py3-pillow &&   pip3 install --no-cache-dir --break-system-packages pdfplumber          0.0s
 => [backend stage-1 4/8] COPY package*.json ./                                                                                                                 0.0s
 => [backend stage-1 5/8] RUN npm ci                                                                                                                           13.7s
 => [backend builder 4/8] COPY tsconfig.json ./                                                                                                                 0.0s
 => [backend builder 5/8] COPY nest-cli.json ./                                                                                                                 0.0s
 => [backend builder 6/8] RUN npm ci                                                                                                                           13.6s
 => [backend builder 7/8] COPY . .                                                                                                                              0.3s
 => ERROR [backend builder 8/8] RUN npm run build                                                                                                              15.8s
------
 > [backend builder 8/8] RUN npm run build:
0.184
0.184 > backend@1.0.0 build
0.184 > nest build
0.184
15.13 src/modules/auth/auth.service.spec.ts:245:55 - error TS2345: Argument of type 'any' is not assignable to parameter of type 'never'.
15.13
15.13 245       jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as any);
15.13                                                           ~~~~~~~~~~~
15.13 src/modules/auth/auth.service.spec.ts:291:55 - error TS2345: Argument of type 'false' is not assignable to parameter of type 'never'.
15.13
15.13 291       jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
15.13                                                           ~~~~~
15.13 src/modules/storage/storage.service.ts:51:22 - error TS1016: A required parameter cannot follow an optional parameter.
15.13
15.13 51     private readonly userRepository: Repository<User>,
15.13                         ~~~~~~~~~~~~~~
15.13 src/modules/storage/storage.service.ts:168:65 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'Pick<Statement, "id" | "filePath">'.
15.13
15.13 168             ? await this.fileStorageService.getFileAvailability(statement.id)
15.13                                                                     ~~~~~~~~~~~~
15.13 src/modules/users/users.controller.ts:47:7 - error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
15.13
15.13 47       page ? parseInt(page) : 1,
15.13          ~~~~~~~~~~~~~~~~~~~~~~~~~
15.13 src/modules/users/users.service.spec.ts:286:44 - error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
15.13
15.13 286       const result = await service.findAll(1, 20);
15.13                                                ~
15.13 src/modules/users/users.service.spec.ts:295:29 - error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
15.13
15.13 295       await service.findAll(1, 20);
15.13                                 ~
15.13 src/modules/users/users.service.spec.ts:311:29 - error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
15.13
15.13 311       await service.findAll(1, 20);
15.13                                 ~
15.13 src/modules/users/users.service.spec.ts:325:44 - error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.
15.13
15.13 325       const result = await service.findAll(1, 20);
15.13                                                ~
15.13 src/modules/workspaces/workspaces.service.ts:25:3 - error TS2305: Module '"../../emails/workspace-invitation.email"' has no exported member 'WorkspaceInvitationEmail'.
15.13
15.13 25   WorkspaceInvitationEmail,
15.13      ~~~~~~~~~~~~~~~~~~~~~~~~
15.13 src/modules/workspaces/workspaces.service.ts:26:3 - error TS2305: Module '"../../emails/workspace-invitation.email"' has no exported member 'workspaceInvitationEmailText'.
15.13
15.13 26   workspaceInvitationEmailText,
15.13      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
15.13
15.13 Found 11 error(s).
15.13
------
Dockerfile:18

--------------------

  16 |

  17 |     # Build application

  18 | >>> RUN npm run build

  19 |

  20 |     # Production stage

--------------------

target backend: failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1